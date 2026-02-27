# REVIEW.md

> AI code review configuration for the DevLLMOps Quiz App.

## Review Checklist

1. **Bugs and Logic Errors** -- incorrect conditions, wrong return values, broken quiz scoring
2. **OWASP Top 10** -- injection via POST /api/answers, XSS in static files, sensitive data exposure
3. **Error Handling** -- unhandled exceptions in FastAPI routes, missing HTTP error responses
4. **Performance** -- blocking calls in async routes, unbounded response payloads
5. **Code Style** -- Python/PEP 8 conventions, type hints on public functions

## Severity Levels

| Severity | Definition | Action |
| --- | --- | --- |
| **Critical** | Security vulnerability or data loss risk | Block merge |
| **High** | Bug causing incorrect quiz scoring or broken endpoints | Block merge |
| **Medium** | Missing edge case, code smell, minor issue | Flag for author |
| **Low** | Style nit, naming suggestion, optional improvement | Informational |

## Auto-Approve Criteria

Auto-approve when ALL are true:

- No Critical or High findings
- No security-critical paths modified (see below)
- Diff under 500 lines

## Always Flag for Human Review

- `app/src/main.py` -- API endpoint definitions and input handling
- `scripts/deploy*.sh` -- Deployment scripts
- `.github/workflows/` -- CI/CD pipeline definitions
- `Dockerfile`, `compose.*.yml` -- Container and orchestration config
- `requirements.txt` -- Dependency changes

## Project-Specific Rules

- `POST /api/answers` must validate that `answers` is a dict with string keys and integer values
- `GET /api/questions` must never return the `correct` field to the client
- Questions in `questions.py` must have exactly 4 options and a valid `correct` index (0-3)
- Static files under `app/src/static/` must not contain inline scripts or external CDN links
- CORS must not be set to `*` in production configuration
- Health endpoint (`GET /health`) must remain a simple JSON response with no side effects
