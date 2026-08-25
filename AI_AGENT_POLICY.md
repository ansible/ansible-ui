# AI agent configuration policy

This document covers AI coding-agent configuration in this repository (Claude
Code, Cursor, and similar tools that read project instruction files). For
AI-assisted **contributions** (disclosure, accountability, quality standards),
see [`AI_POLICY.md`](AI_POLICY.md).

## No executable agent hooks in git

**Agent hooks are not allowed in this repository.**

Executable hook scripts (for example Claude Code `hooks/` wired through
`settings.json`) must not be committed. They can run shell commands during agent
sessions and are a supply-chain risk in a public tree.

### What we ship instead

| Allowed in git | Role |
| --- | --- |
| `CLAUDE.md`, `AGENTS.md` | On-demand agent instructions |
| `.claude/skills/**` | Shared skill documents and user-invoked helper scripts |
| `.claude/commands/**` | Slash-command prompts as markdown |
| `.claude/skill-triggers.json` | Advisory file-type → skill mapping |

Skills and commands are documentation loaded by the agent. A skill may include a
helper script (for example `.claude/skills/sonarcloud-remediation/scripts/`) that
a contributor runs explicitly as part of that skill. These are **not** agent
hooks: they never run automatically during a session, and running them requires
an explicit, user-approved permission. The ban is on hooks that execute
automatically (for example `PreToolUse`/`PostToolUse` wired through
`settings.json`).

### Local-only agent settings

Local agent runtime files must not be committed. [`.gitignore`](.gitignore)
ignores `.claude/*` by default and un-ignores only shared skills and commands.
In particular, keep these local:

- `.claude/settings.json` and `.claude/settings.local.json`
- `.claude/hooks/` and any other non-skill agent runtime files
- `CLAUDE.local.md`, `AGENTS.local.md`
- Editor-local dirs such as `.cursor/`

Do not force-add ignored agent settings or hooks in a pull request.

## Review bar for agent docs

Pull requests that change shared agent skills or instruction files should:

1. Stay safe for a **public** repository (no internal hostnames, private Slack
   channels, credentials, or org-only runbooks).
2. Prefer linking to public documentation over embedding internal process.
3. Stay advisory — do not add executable hook wiring.

See [`.github/CODEOWNERS`](.github/CODEOWNERS) for reviewers on touched paths.
