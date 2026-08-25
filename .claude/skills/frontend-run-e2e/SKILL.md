---
name: frontend-run-e2e
description: >
  Interactive wizard to launch Playwright E2E tests. Use when the user asks to
  run, execute, or debug E2E tests, or which env vars are required. Never print
  secrets.
user-invocable: true
---

# Running E2E tests

For **writing** tests, read `.claude/skills/testing_guidelines.md` (Playwright
Testing). For paths, ports, and password files, read `frontend-overlay`.

When invoked, gather config with sensible defaults. Confirm or override — do
not make the user start from a blank form.

## Secrets

If the suite needs a password or token:

1. Never `cat` / `head` / print the secret file
2. Check existence with `test -f`
3. Pass via shell expansion only inside the command the user runs, not in chat
4. When previewing the command, show `$(grep …)` / env var names — never the value
5. If you accidentally read a secret, do not repeat it

## Wizard

1. Resolve repo root (`git rev-parse --show-toplevel`)
2. Overlay defaults: mock vs live, UI URL, grep / file path, headed?
3. Confirm with the user
4. Preflight: node, Playwright browsers, overlay “is the stack up?” checks
5. Run **one** command from overlay (`npm run live`, `npx playwright test …`)
6. Summarize: passed / failed / skipped. Do not dump full traces unless asked

Do not start a second copy of the UI if overlay says a server is already bound
to those ports.
