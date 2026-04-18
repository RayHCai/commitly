Project Structure

worker/
├── app/
│   ├── main.py              ← FastAPI app + /health endpoint
│   ├── config.py             ← Pydantic Settings (all env vars)
│   ├── api/
│   │   ├── ingest.py         ← POST /ingest + GET /tasks/{id}
│   │   └── create.py         ← POST /create + GET /create/tasks/{id}
│   ├── schemas/
│   │   ├── ingest.py         ← IngestRequest, TaskResponse, TaskStatusResponse
│   │   └── create.py         ← CreateRequest, MatchedContribution, CreateResult
│   ├── tasks/
│   │   ├── celery_app.py     ← Celery instance (Redis broker + backend)
│   │   ├── ingest.py         ← Celery task: Express API → Gemini embed → Weaviate
│   │   └── create.py         ← Celery task: Weaviate search → Gemini score/summarize
│   └── services/
│       ├── express.py        ← httpx client to your Express API
│       ├── gemini.py         ← text-embedding-004 + gemini-2.0-flash
│       └── weaviate_client.py ← Collection CRUD + vector search
├── Dockerfile
├── requirements.txt
└── .env.example
docker-compose.yml            ← api, worker-ingest, worker-create, redis, weaviate
Key design choices
Separate Celery workers for ingest and create queues (different concurrency: 4 vs 2)
Task polling via GET /tasks/{task_id} returns real-time progress states (PROGRESS, SUCCESS, etc.)
Each commit = one embedding as you specified — text is message + diff
Vector search filtered by user_id so create only retrieves that user's commits
host.docker.internal used for Express API access from inside Docker
To run
Copy worker/.env.example → worker/.env and set your GEMINI_API_KEY
docker compose up --build