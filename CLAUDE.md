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
listed in `.claude/skills/library_references.md` and state that fallback.

The MCP versions are pinned in `.mcp.json` for reproducible agent behavior.
PatternFly MCP 2.x requires Node.js 22+; use a Node 22+ local runtime for MCP
startup even though some CI jobs currently use Node 20.

This repo has no Storybook. Do not use `@latest` for MCP packages.

### Rules

- ESLint-enforced items are omitted from checklists. ESLint is the source of truth.
- New code: zero new ESLint warnings. No `eslint-disable` in new or modified code.
- Accessibility is part of every UI change.
- `npm test` (eslint, tsc, prettier, vitest) before calling the work done.
- Never remove existing features, routes, or components without explicit instruction.
