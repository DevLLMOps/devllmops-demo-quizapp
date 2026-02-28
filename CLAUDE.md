# CLAUDE.md

> This file provides context to AI agents working on this project.
> Update it with every architectural decision.

## Project Overview

A quiz web application that tests knowledge of the DevLLMOps methodology. Built as a reference implementation following DevLLMOps + OCPA specs.

## Tech Stack

- **Runtime:** Python 3.12
- **Framework:** FastAPI 0.115.8
- **Server:** Uvicorn 0.34.0
- **Frontend:** Vanilla HTML/CSS/JS (served by FastAPI as static files)
- **Deployment:** Docker Compose (OCPA multi-environment setup)

## Project Structure

```text
├── app/
│   ├── Dockerfile         # Multi-stage: dev (hot-reload) + prod (baked)
│   ├── requirements.txt   # Python dependencies (pinned versions)
│   └── src/
│       ├── main.py        # FastAPI app: routes, API endpoints
│       ├── questions.py   # Quiz question data
│       └── static/        # Frontend assets (HTML, CSS, JS)
├── scripts/               # OCPA deployment and validation scripts
├── compose.base.yml       # Shared service config (ports, healthcheck, logging)
├── compose.dev.yml        # Dev: hot-reload via volume mounts
├── compose.prod.yml       # Prod: static files baked into image
├── compose.test.yml       # API + E2E tests via Playwright
├── tests/
│   └── e2e/               # Playwright test specs + Dockerfile
└── Makefile               # Standardized commands (make dev, make test, etc.)
```

## Key Conventions

- All image versions pinned (OCPA-R1): no `latest` tags in Dockerfiles or compose
- Single `.env.example` as source of truth for host env vars
- Port configured via `APP_PORT` env var (default: 8000)
- Internal port always 8000 (FastAPI)
- Quiz questions defined in `app/src/questions.py` as a Python list of dicts
- Frontend is vanilla JS -- no build step, no framework

## API Endpoints

- `GET /` -- Serves the quiz HTML page
- `GET /health` -- Health check (returns `{"status": "ok"}`)
- `GET /api/questions` -- Returns questions without correct answers
- `POST /api/answers` -- Accepts `{"answers": {question_id: option_index}}`, returns score + corrections

## Team

See [TEAM.md](TEAM.md) for team members, roles, and review assignments.
When creating PRs or issues, tag the appropriate reviewer based on their review scope.

## Security-Critical Paths (always require human review)

- `app/src/main.py` -- API endpoint definitions and input handling
- `scripts/deploy*.sh` -- Deployment scripts
- `.github/workflows/` -- CI/CD pipeline definitions

## Common Commands

```bash
make dev         # Start dev environment with hot reload
make test        # Run API tests (curl) + E2E tests (Playwright)
make prod        # Start production environment
make down        # Stop all services
```

## Reviews

Find review instructions at [REVIEW.md](./REVIEW.md)
