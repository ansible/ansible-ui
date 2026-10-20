# Agent skills

Codex is the primary coding agent for this repository. Repository instructions
live in this file; CLAUDE.md is a compatibility symlink. Codex skills live in
.agents/skills/<name>/ with a short SKILL.md entrypoint and optional
references/ and scripts/. Keep each skill's name and description metadata
accurate and keep entrypoints concise.

| Trigger | Read |
| --- | --- |
| Before implementing, reviewing, or refactoring frontend code | .agents/skills/frontend-specialist/SKILL.md |
| Before writing components, forms, pages, or hooks | .agents/skills/coding-standards/SKILL.md |
| Product wrappers, API helpers, paths | .agents/skills/frontend-overlay/SKILL.md |
| Before writing or reviewing a Vitest unit/component test | .agents/skills/testing-guidelines/SKILL.md |
| Writing, running, or debugging Playwright E2E | .agents/skills/frontend-playwright-e2e/SKILL.md |
| Before reviewing a pull request | .agents/skills/pr-review/SKILL.md |
| Before coding with React, SWR, Vitest, Vite, or PatternFly 6 | .agents/skills/library-references/SKILL.md |
| When analyzing SonarCloud issues | .agents/skills/sonarcloud-analyze/SKILL.md |
| When fixing selected SonarCloud issues | .agents/skills/sonarcloud-fix/SKILL.md |
| For shared SonarCloud remediation guidance | .agents/skills/sonarcloud-remediation/SKILL.md |

Skills are advisory documentation; do not load every skill at once. They must not
wire executable agent hooks. See AI_AGENT_POLICY.md.

### MCP consultation workflow

MCPs are part of the implementation workflow, not optional background tooling.
Before implementing or changing frontend code, consult the relevant MCPs and use
their results together with the repository wrappers and existing patterns.

1. **PatternFly MCP** — Before using a PatternFly component, variant, prop,
   token, or accessibility pattern, search the official PF6 documentation. Do
   not invent props or rely on memory. Prefer an existing wrapper in
   `framework/` or the relevant product package when one exists.
2. **Playwright MCP** — For UI behavior, workflows, or E2E changes, inspect the
   running UI and validate the changed flow with accessible locators. Do not
   start a second UI if port 4100 is already bound.
3. **Chrome DevTools MCP** — For browser debugging, inspect console errors,
   failed network requests, layout issues, and performance regressions in the
   running UI. Use it alongside Playwright when the failure is browser-specific.

Record which MCP documentation or browser evidence informed the implementation
in the final handoff. If an MCP is unavailable, use the official documentation
listed in `.agents/skills/library-references/SKILL.md` and state that fallback.

The MCP versions are pinned in `.mcp.json` for reproducible agent behavior.
PatternFly MCP 2.x requires Node.js 22+; use a Node 22+ local runtime for MCP
startup even though some CI jobs currently use Node 20.

This repo has no Storybook. Do not use `@latest` for MCP packages.

### Rules

- ESLint-enforced items are omitted from checklists. ESLint is the source of truth.
- New code: zero new ESLint warnings, including `npm run eslint:guardrails`. Guardrail rules live in `eslint.guardrails.config.mjs`; the primary project config is `eslint.config.mjs`. No `eslint-disable` in new or modified code.
- Accessibility is part of every UI change.
- `npm test` (eslint, tsc, prettier, vitest) and `npm run eslint:guardrails` on touched files before calling the work done.
- Never remove existing features, routes, or components without explicit instruction.

### Shared framework delivery

Changes to `framework/` can affect every product workspace. Deliver shared
framework behavior in a dedicated upstream PR before product-specific adoption.
Keep that PR limited to `framework/` and its focused tests; do not combine it
with unrelated feature work, other upstream changes, or Controller, Hub, EDA,
and Platform rollout changes. The framework PR must be independently testable,
document its compatibility impact, include complete relevant framework test
coverage and representative cross-workspace validation, and remain safe to
revert without reverting a product rollout. Follow with separate
product-specific PRs after the shared behavior is accepted.

This checklist targets `framework/`; apply the same separation judgment to
shared `frontend/common/` changes and cross-cutting `platform/` utilities.
