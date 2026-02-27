# Team

> This file is context for AI agents. It tells them who to tag in PRs, issues, and review requests.
> Keep it updated when people join, leave, or change roles.

| Name | Role | GitHub | Review Scope |
| --- | --- | --- | --- |
| Flavien Berwick | Product Architect | @flavienbwk | Architecture, release sign-off |

## Review Routing

| Path Pattern | Required Reviewer | Reason |
| --- | --- | --- |
| `app/src/main.py` | Product Architect | API endpoint changes |
| `scripts/deploy*` | Product Architect | Deployment changes |
| `.github/workflows/` | Product Architect | CI/CD pipeline |
| `CLAUDE.md` | Product Architect | Agent context changes |
| `compose.*.yml` | Product Architect | Architecture |
| `*` (default) | Product Architect | Standard review |
