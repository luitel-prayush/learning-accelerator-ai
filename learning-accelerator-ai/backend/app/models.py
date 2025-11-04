from __future__ import annotations
from datetime import datetime
from typing import List
from sqlalchemy import String, Integer, ForeignKey, DateTime, Boolean, func, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)

    modules: Mapped[List[Module]] = relationship("Module", back_populates="topic", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(300))
    duration_min: Mapped[int] = mapped_column(Integer, default=15)

    topic: Mapped[Topic] = relationship("Topic", back_populates="modules")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    topic: Mapped[str] = mapped_column(String(200), index=True)
    correct: Mapped[bool] = mapped_column(Boolean, default=False)
    answer_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), index=True)


class TopicSuggestion(Base):
    __tablename__ = "topic_suggestions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    query: Mapped[str] = mapped_column(String(200), index=True)
    suggestion: Mapped[str] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), index=True)
