# Agent instructions and skills

Repository instructions live in this file; `CLAUDE.md` is a compatibility
symlink for tools that look for that filename. Shared skill guidance lives in
`.agents/skills/<name>/`, with a short `SKILL.md` entrypoint and optional
references and scripts. Use the trigger table to load only the relevant skill.
This layout is the source of truth; integrations may also provide native skill
discovery or thin command adapters. Keep skill names and descriptions accurate
and entrypoints concise.

| Trigger | Read |
| --- | --- |
| Before implementing, reviewing, or refactoring frontend code | .agents/skills/frontend-specialist/SKILL.md |
| Before writing components, forms, pages, or hooks | .agents/skills/apply-coding-standards/SKILL.md |
| Product wrappers, API helpers, paths | .agents/skills/apply-frontend-overlay/SKILL.md |
| Before writing or reviewing a Vitest unit/component test | .agents/skills/testing-guidelines/SKILL.md |
| Writing, running, or debugging Playwright E2E | .agents/skills/write-playwright-e2e/SKILL.md |
| Before reviewing a pull request | .agents/skills/review-pr/SKILL.md |
| Before coding with React, SWR, Vitest, Vite, or PatternFly 6 | .agents/skills/library-references/SKILL.md |
| When analyzing SonarCloud issues | .agents/skills/sonarcloud-analyze/SKILL.md |
| When fixing selected SonarCloud issues | .agents/skills/sonarcloud-fix/SKILL.md |
| For shared SonarCloud remediation guidance | .agents/skills/sonarcloud-remediation/SKILL.md |

Skills are advisory documentation; do not load every skill at once. They must not
wire executable agent hooks. See AI_AGENT_POLICY.md.

### MCP consultation workflow

When relevant MCP integrations are available, consult them before implementing
or changing frontend code and use their results together with repository
wrappers and existing patterns. If an integration is unavailable, continue with
the official documentation and repository patterns.

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
in the final handoff when such tools were used. Otherwise, use the official
documentation listed in `.agents/skills/library-references/SKILL.md`.

MCP server versions are pinned in `.mcp.json` for reproducible behavior.
PatternFly MCP 2.x requires Node.js 22+; use a Node 22+ local runtime when
starting that server even though some CI jobs currently use Node 20.

This repo has no Storybook. Do not use `@latest` for MCP packages.

### Rules

- ESLint-enforced items are omitted from checklists. ESLint is the source of truth.
- New code: zero new ESLint warnings, including `npm run eslint:guardrails`. Guardrail rules live in `eslint.guardrails.config.mjs`; the primary project config is `eslint.config.mjs`. No `eslint-disable` in new or modified code.
- Accessibility is part of every UI change.
- For code changes, run checks scoped to the changed paths: relevant lint,
  type, unit, and guardrail checks. Run Playwright only when the change affects
  browser behavior and the relevant flow is not already covered by current CI.
  Documentation-only changes do not require application tests or Playwright.
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
