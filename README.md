# Commitly

Commitly turns a developer's GitHub commit history into job-specific pages that show recruiters which real contributions match a given job posting. It embeds and scores commits with Gemini, stores them in Weaviate, matches them against the scraped job posting, and won Best Use of AWS at Hook 'Em Hacks 2026.

```mermaid
flowchart LR
  web["Web<br/>TypeScript, Next.js"] --> api["API<br/>TypeScript, Express"]
  api --> db[("PostgreSQL")]
  api --> redis[("Redis")]
  api --> s3["AWS S3"]
  api --> github["GitHub API"]
  api --> workerapi["Worker API<br/>Python, FastAPI"]
  workerapi --> redis
  tasks["Task workers<br/>Python, Celery"] --> redis
  tasks --> api
  tasks --> weaviate[("Weaviate")]
  tasks --> gemini["Gemini API"]
  tasks --> jina["Jina Reader"]
  tasks --> solana["Solana"]
```
