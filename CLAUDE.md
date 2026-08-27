# Agent skills

Skills are advisory markdown. Do not load every skill at once.

| Trigger | Read |
| --- | --- |
| Before implementing, reviewing, or refactoring frontend code | `.claude/skills/frontend_specialist.md` |
| Before writing components, forms, pages, or hooks | `.claude/skills/coding_standards.md` |
| Product wrappers, API helpers, paths | `.claude/skills/frontend-overlay/SKILL.md` |
| Before writing or reviewing a Vitest unit/component test | `.claude/skills/testing_guidelines.md` |
| Writing, running, or debugging Playwright E2E | `.claude/skills/frontend-playwright-e2e/SKILL.md` |
| Before reviewing a pull request | `.claude/skills/pr_review.md` |
| Before coding with React, SWR, Vitest, Vite, or PatternFly 6 | `.claude/skills/library_references.md` |
| When fixing SonarCloud issues | `.claude/skills/sonarcloud-remediation/sonarcloud-remediation.md` |

To add or change file-based skill triggers, edit `.claude/skill-triggers.json`. Keep this table in sync. This repository does not ship executable agent hooks; see [`AI_AGENT_POLICY.md`](AI_AGENT_POLICY.md).

### MCP (when available)

Never invent component props. Use source docs or MCP first.

1. PatternFly docs / MCP — official PF6 props (when pinned in `.mcp.json`).
2. Playwright MCP — browser. Do not start a second UI if port 4100 is already bound.

This repo has no Storybook. Do not use `@latest` for MCP packages.

### Rules

- ESLint-enforced items are omitted from checklists. ESLint is the source of truth.
- New code: zero new ESLint warnings. No `eslint-disable` in new or modified code.
- Accessibility is part of every UI change.
- `npm test` (eslint, tsc, prettier, vitest) before calling the work done.
- Never remove existing features, routes, or components without explicit instruction.
