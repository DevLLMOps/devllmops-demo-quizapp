"""Quiz questions about the DevLLMOps methodology."""

QUESTIONS = [
    {
        "id": 1,
        "question": "What does DevLLMOps replace in software development?",
        "options": [
            "The traditional SDLC with a tight intent-agent-observe loop",
            "Only the testing phase of development",
            "The programming language used by the team",
            "Just the deployment pipeline",
        ],
        "correct": 0,
        "explanation": "DevLLMOps collapses the entire SDLC (Requirements > Design > Code > Test > Review > Deploy > Monitor) into a tight loop: Intent > Agent > Build+Test+Deploy > Observe.",
    },
    {
        "id": 2,
        "question": "What is the most important file for AI agent output quality?",
        "options": [
            "package.json",
            "Dockerfile",
            "CLAUDE.md (or equivalent agent context file)",
            ".gitignore",
        ],
        "correct": 2,
        "explanation": "CLAUDE.md provides architecture context, conventions, and constraints to the AI agent. The quality of agent output is directly proportional to the quality of context you provide.",
    },
    {
        "id": 3,
        "question": "Which role evolved from DevOps/SRE in the DevLLMOps methodology?",
        "options": [
            "Context Engineer",
            "Product Architect",
            "AI Ops Lead",
            "Quality Sentinel",
        ],
        "correct": 3,
        "explanation": "The Quality Sentinel inherits the observability, incident response, and security hardening responsibilities from DevOps/SRE. Infrastructure-as-code writing is now handled by agents.",
    },
    {
        "id": 4,
        "question": "What is the primary safety mechanism when agents ship faster than humans can review?",
        "options": [
            "Manual code review on every PR",
            "Sprint retrospectives",
            "Observability and monitoring",
            "Story point estimation",
        ],
        "correct": 2,
        "explanation": "Monitoring is the last stage standing from the traditional SDLC. It becomes the foundation everything else rests on -- the primary safety net when every other safeguard has been absorbed by automation.",
    },
    {
        "id": 5,
        "question": "What replaces sprint planning in DevLLMOps?",
        "options": [
            "Longer sprints (monthly instead of bi-weekly)",
            "Continuous intent-based flow with GitHub Issues as context stores",
            "Daily planning meetings with the AI agent",
            "Quarterly roadmap reviews only",
        ],
        "correct": 1,
        "explanation": "Work is continuous in DevLLMOps. GitHub Issues become intent documents (context stores for agents), not task trackers. There are no sprints, no story points.",
    },
    {
        "id": 6,
        "question": "What is the purpose of TEAM.md in a DevLLMOps project?",
        "options": [
            "To list the project's dependencies",
            "To document the project's API endpoints",
            "To tell AI agents who to tag in PRs and issues based on review scope",
            "To track team velocity metrics",
        ],
        "correct": 2,
        "explanation": "TEAM.md is a machine-readable team roster that maps roles and GitHub handles to review scopes. Agents use it to route PRs to the right reviewer automatically.",
    },
    {
        "id": 7,
        "question": "What is the key skill in the AI-native development era?",
        "options": [
            "Typing speed",
            "Memorizing API documentation",
            "Context engineering",
            "Writing unit tests manually",
        ],
        "correct": 2,
        "explanation": "Context engineering is the ability to give an agent exactly the right information to produce correct output. The quality of what you build is directly proportional to the quality of context.",
    },
    {
        "id": 8,
        "question": "When should humans review AI-generated code in DevLLMOps?",
        "options": [
            "On every single PR, as always",
            "Never -- agents handle everything",
            "Only for security-critical changes, novel architecture, and unresolvable conflicts",
            "Only on Fridays",
        ],
        "correct": 2,
        "explanation": "Human review becomes exception-based. It's triggered only for security-critical paths (auth, payments, infra), novel architectural decisions, or when automated verification can't resolve a conflict.",
    },
    {
        "id": 9,
        "question": "What git strategy does DevLLMOps use (per OCPA specs)?",
        "options": [
            "GitFlow with develop, feature, release, and hotfix branches",
            "Trunk-based development with main, release, and short-lived feature branches",
            "Single main branch with no other branches",
            "One branch per developer",
        ],
        "correct": 1,
        "explanation": "DevLLMOps follows OCPA's flexible flow: main (staging), release (production), and short-lived feature branches. Squash merges keep history clean. Feature branches should live hours, not days.",
    },
    {
        "id": 10,
        "question": "What role is responsible for managing AI token costs in a large team?",
        "options": [
            "Product Architect",
            "Context Engineer",
            "Quality Sentinel",
            "AI Ops Lead",
        ],
        "correct": 3,
        "explanation": "The AI Ops Lead is a new role for large teams (5+ Context Engineers or $5K+/month AI costs). They manage token budgets, model selection strategy, and agent orchestration pipelines.",
    },
]
