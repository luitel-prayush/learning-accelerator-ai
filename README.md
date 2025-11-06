# Learning Accelerator AI

Monorepo containing a lightweight learning assistant:
- Frontend: Vite + TypeScript + Tailwind (FAST components)
- Backend: FastAPI + SQLAlchemy + Alembic (SQLite for local dev)

## Project Structure
```
learning-accelerator-ai/
  backend/              # FastAPI app and DB models
  public/               # Static assets
  src/                  # Frontend source (Vite)
  index.html            # App entry
```

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+

## Backend (FastAPI)
Install deps and run the API server:
```bash
# from repository root
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r learning-accelerator-ai/backend/requirements.txt

# run API
uvicorn learning-accelerator-ai.backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
API docs: http://127.0.0.1:8000/docs

### Database
- SQLite is used for local development (created automatically).
- Alembic migrations are included under `learning-accelerator-ai/backend/alembic/`.

## Frontend (Vite)
Install deps and start dev server:
```bash
cd learning-accelerator-ai
npm install
npm run dev
```
Vite dev server: http://127.0.0.1:5173

The frontend proxies API requests to the FastAPI server via `vite.config.ts`:
- `/api` -> `http://127.0.0.1:8000`

## Key API Endpoints
- `GET /api/health` – health check
- `POST /api/topics/suggest` – suggest topics
- `POST /api/learn/path` – get learning path for a topic
- `POST /api/quiz/next` – get next quiz question
- `POST /api/quiz/submit` – submit answer and receive score
- `POST /api/chat` – chat with the assistant (requires OPENAI_API_KEY)
- `GET /api/progress` – simple progress summary

## Development Tips
- If ports differ, update the proxy target in `learning-accelerator-ai/vite.config.ts`.
- Ensure the backend is running before using the app; the frontend depends on the `/api` routes.

## Chat (OpenAI) Setup

To use the Chat feature, you need an OpenAI API key.

- **Get an API key**
  1. Go to https://platform.openai.com/ and sign in.
  2. Ensure you have a billing method set up (required to generate keys in most accounts).
  3. Visit https://platform.openai.com/api-keys and click “Create new secret key”.
  4. Copy the key (it looks like `sk-...`).

- **Configure the environment**
  - Copy `.env.example` to `.env` at the repo root and set:
    ```
    OPENAI_API_KEY=sk-your-key-here
    ```
  - `.env` is git-ignored; do not commit it.

- **Run backend**
  - Start the API server after setting the env file so it’s loaded:
    ```bash
    uvicorn learning-accelerator-ai.backend.app.main:app --reload --host 127.0.0.1 --port 8000
    ```

- **Test chat endpoint**
  ```bash
  curl -X POST http://127.0.0.1:8000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Hello!"}], "system":"You are a concise learning assistant."}'
  ```

## Scripts
Frontend (run inside `learning-accelerator-ai/`):
```bash
npm run dev       # start Vite dev server
npm run build     # type-check + build
npm run preview   # preview production build
```

## License
Choose a license for your project (e.g., MIT). You can add a `LICENSE` file at the repo root.

## Contributing
- Create feature branches from `main`.
- Submit PRs for review.
