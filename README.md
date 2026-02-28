# DevLLMOps Demo: Quiz App

<p align="center">
  <img src="docs/assets/badge-aigile.svg" alt="AIgile methodology" />
</p>

> A quiz app about the [DevLLMOps specifications](https://github.com/flavienbwk/devllmops), built following AIgile's methodology + [OCPA specs](https://github.com/flavienbwk/ocpa-specs).

Test your knowledge of AI-native software development: team roles, workflow, tooling, and methodology.

## Quick Start

```bash
cp .env.example .env
make dev
# Open http://localhost:8000
```

## Commands (OCPA)

```bash
make dev          # Start dev environment (hot-reload)
make test         # Run integration tests
make prod         # Build and start production
make down         # Stop everything
```

## Project Structure

```text
├── app/
│   ├── Dockerfile         # Multi-stage (dev + prod targets)
│   ├── requirements.txt   # Pinned Python deps
│   └── src/
│       ├── main.py        # FastAPI backend
│       ├── questions.py   # Quiz questions data
│       └── static/        # Frontend (HTML/CSS/JS)
├── scripts/               # OCPA deployment scripts
├── .github/workflows/     # CI: build, test, lint, AI review
├── compose.base.yml       # Shared config
├── compose.dev.yml        # Dev environment
├── compose.prod.yml       # Production environment
├── compose.test.yml       # Integration tests
├── CLAUDE.md              # AI agent context
├── TEAM.md                # Team roster for agent routing
└── Makefile               # Standardized commands
```

## API

| Endpoint | Method | Description |
| --- | --- | --- |
| `/` | GET | Quiz frontend |
| `/health` | GET | Health check |
| `/api/questions` | GET | Questions (without answers) |
| `/api/answers` | POST | Submit answers, get score |

## CI/CD Workflows

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| **Build** | Push/PR to main/release | Build dev+prod images, push to ghcr.io |
| **Test** | Push/PR to main/release | Integration tests via `make test` |
| **Linters** | Push/PR | Markdownlint, gitleaks, ruff, env validation |
| **AI Review** | PR to main | Claude Haiku adversarial code review |
| **PR Direction** | PR opened | Block release-to-main PRs |

## Git Flow (OCPA)

- `main` -- Staging (auto-deploy)
- `release` -- Production (manual merge from main)
- Feature branches: short-lived, one per intent/issue
- PR titles prefixed with issue number: `#12: Add leaderboard`
- Squash merge to main

## Methodology

This repo implements the [DevLLMOps specification](https://github.com/flavienbwk/devllmops):

- **Intent-driven development** via GitHub Issues ([template](.github/ISSUE_TEMPLATE/intent.yml))
- **AI agent context** via [CLAUDE.md](CLAUDE.md)
- **Team routing** via [TEAM.md](TEAM.md)
- **Automated verification** (CI + AI adversarial review)
- **Human review** only for security-critical and novel changes

## License

MIT
