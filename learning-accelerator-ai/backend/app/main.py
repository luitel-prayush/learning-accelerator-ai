from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from .db import get_db, init_db
from . import models

app = FastAPI(title="Learning Accelerator API", version="0.1.0")

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SuggestRequest(BaseModel):
    query: str


class LearnPathRequest(BaseModel):
    topic: str


class QuizNextRequest(BaseModel):
    topic: str
    history: Optional[List[dict]] = None

class QuizSubmitRequest(BaseModel):
    topic: str
    question_id: str
    answer: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/topics/suggest")
def topics_suggest(req: SuggestRequest, db: Session = Depends(get_db)):
    q = req.query.strip()
    seeds = [
        f"{q} fundamentals",
        f"{q} practice",
        f"advanced {q}",
    ] if q else ["python", "linear algebra", "docker"]
    # persist suggestions
    for s in seeds[:5]:
        db.add(models.TopicSuggestion(query=q or "", suggestion=s))
    db.commit()
    return {"suggestions": seeds[:5]}


# RESTful: GET /api/topics?suggest=python
@app.get("/api/topics")
def topics(query: Optional[str] = None, db: Session = Depends(get_db)):
    if query is None:
        # list topics
        rows = db.query(models.Topic).all()
        return {"items": [{"id": t.id, "name": t.name} for t in rows]}
    q = query.strip()
    seeds = [
        f"{q} fundamentals",
        f"{q} practice",
        f"advanced {q}",
    ] if q else ["python", "linear algebra", "docker"]
    for s in seeds[:5]:
        db.add(models.TopicSuggestion(query=q or "", suggestion=s))
    db.commit()
    return {"suggestions": seeds[:5]}


@app.post("/api/learn/path")
def learn_path(req: LearnPathRequest, db: Session = Depends(get_db)):
    topic_name = req.topic.strip() or "General Learning"
    topic = db.query(models.Topic).filter(models.Topic.name == topic_name).first()
    if topic is None:
        topic = models.Topic(name=topic_name)
        db.add(topic)
        db.flush()

    # If no modules yet, seed defaults
    if not topic.modules:
        defaults = [
            (f"Introduction to {topic_name}", 15),
            (f"Core Concepts of {topic_name}", 25),
            (f"Practice: {topic_name}", 20),
        ]
        for title, duration in defaults:
            db.add(models.Module(topic_id=topic.id, title=title, duration_min=duration))
        db.commit()
        db.refresh(topic)

    modules = [
        {"id": m.id, "title": m.title, "duration_min": m.duration_min}
        for m in topic.modules
    ]
    return {"topic": topic.name, "modules": modules}


def _get_or_create_topic(db: Session, topic_name: str) -> models.Topic:
    t = db.query(models.Topic).filter(models.Topic.name == topic_name).first()
    if t is None:
        t = models.Topic(name=topic_name)
        db.add(t)
        db.flush()
    return t


# RESTful: GET /api/topics/{topic}/modules
@app.get("/api/topics/{topic}/modules", status_code=status.HTTP_200_OK)
def get_topic_modules(topic: str, db: Session = Depends(get_db)):
    name = (topic or "").strip() or "General Learning"
    t = _get_or_create_topic(db, name)
    if not t.modules:
        defaults = [
            (f"Introduction to {name}", 15),
            (f"Core Concepts of {name}", 25),
            (f"Practice: {name}", 20),
        ]
        for title, duration in defaults:
            db.add(models.Module(topic_id=t.id, title=title, duration_min=duration))
        db.commit()
        db.refresh(t)
    return {
        "topic": t.name,
        "items": [{"id": m.id, "title": m.title, "duration_min": m.duration_min} for m in t.modules],
    }


@app.post("/api/quiz/next")
def quiz_next(req: QuizNextRequest):
    topic = req.topic.strip() or "General"
    question = {
        "id": "q1",
        "prompt": f"In {topic}, explain one key concept in a sentence.",
        "type": "free_text",
    }
    return {"question": question}


@app.post("/api/quiz/submit")
def quiz_submit(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    text = (req.answer or "").strip()
    # simple grading: score by length, cap at 1.0
    score = min(len(text) / 60.0, 1.0)
    is_correct = score >= 0.5
    attempt = models.QuizAttempt(
        topic=req.topic.strip() or "General",
        correct=is_correct,
        answer_text=text,
        score=score,
    )
    db.add(attempt)
    db.commit()
    return {"correct": is_correct, "score": round(score, 3)}


# RESTful: GET /api/topics/{topic}/quiz/next
@app.get("/api/topics/{topic}/quiz/next")
def quiz_next_rest(topic: str):
    name = (topic or "").strip() or "General"
    question = {
        "id": "q1",
        "prompt": f"In {name}, explain one key concept in a sentence.",
        "type": "free_text",
    }
    return {"question": question}


# RESTful: POST /api/topics/{topic}/quiz/attempts
class QuizAttemptCreate(BaseModel):
    question_id: str
    answer: str


@app.post("/api/topics/{topic}/quiz/attempts", status_code=status.HTTP_201_CREATED)
def create_quiz_attempt(topic: str, payload: QuizAttemptCreate, db: Session = Depends(get_db)):
    name = (topic or "").strip() or "General"
    text = (payload.answer or "").strip()
    score = min(len(text) / 60.0, 1.0)
    is_correct = score >= 0.5
    attempt = models.QuizAttempt(topic=name, correct=is_correct, answer_text=text, score=score)
    db.add(attempt)
    db.commit()
    return {"topic": name, "correct": is_correct, "score": round(score, 3)}


@app.get("/api/progress")
def progress(db: Session = Depends(get_db)):
    total = db.query(models.QuizAttempt).count()
    # mastery as average score
    if total:
        from sqlalchemy import func as safunc
        avg_score = db.query(safunc.avg(models.QuizAttempt.score)).scalar() or 0.0
        mastery = float(avg_score)
    else:
        mastery = 0.0

    # naive minutes studied: sum durations of all modules
    minutes = 0
    for m in db.query(models.Module).all():
        minutes += m.duration_min

    return {
        "mastery": round(mastery, 4),
        "reviews_due": max(0, total - int(total * mastery)),
        "minutes_studied": minutes,
    }


@app.on_event("startup")
def on_startup():
    init_db()
