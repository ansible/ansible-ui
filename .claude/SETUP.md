# Pipeline Skills Setup

How to configure `/pipeline-health`, `/pipeline-handoff`, and `/pipeline-triage` for your local environment.

## Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed
- Node.js 20.x+
- GitHub CLI (`gh`) authenticated: `gh auth login`

## 1. Configure MCP Servers

The pipeline skills require two MCP servers: **Currents** (test analytics) and **Atlassian** (JIRA, optional).

### Currents MCP (required)

Get your API key from [app.currents.dev](https://app.currents.dev) under **Settings > API Keys**.

```bash
claude mcp add currents \
  -s local \
  -- npx -y @currents/mcp \
  -e CURRENTS_API_KEY=<your-api-key>
```

This creates a local-scoped server (private to you in this project, not checked into git).

### Atlassian MCP (optional, for JIRA posting)

Only needed if you want to use `--signoff AAP-XXXXX` to post verdicts to JIRA tickets.

Follow the [Atlassian MCP setup guide](https://developer.atlassian.com/cloud/mcp/). The server URL is `https://mcp.atlassian.com/v1/mcp`.

```bash
claude mcp add atlassian \
  -s user \
  -t http \
  -- https://mcp.atlassian.com/v1/mcp
```

## 2. Set Environment Variables

### CURRENTS_PROJECT_ID (required)

The pipeline skills need the Currents project ID. Ask your team lead for the project ID, then set it:

**Option A — Shell profile** (add to `~/.zshrc` or `~/.bashrc`):
```bash
export CURRENTS_PROJECT_ID=<your-project-id>
```

**Option B — Claude settings** (project-scoped):
Add to `.claude/settings.local.json`:
```json
{
  "env": {
    "CURRENTS_PROJECT_ID": "<your-project-id>"
  }
}
```

## 3. Verify Setup

Run a quick check to confirm everything works:

```bash
# Start Claude Code
claude

# Test Currents connection
/pipeline-health --help

# Run a dry pipeline health check
/pipeline-health 2.7 --no-trend --no-history
```

If you see pass rate tables, the Currents MCP is working. If you get "Set the `CURRENTS_PROJECT_ID` environment variable", go back to step 2.

## 4. Optional: Playwright MCP

For browser-based test debugging (used by `/pipeline-triage` when examining live UI):

The Playwright MCP is already configured in `.mcp.json` (checked into git). No additional setup needed — it launches automatically when Claude Code starts in this project.

## Available Skills

Once setup is complete, you have access to:

| Command | Description |
|---------|-------------|
| `/pipeline-health` | Daily pipeline health report with pass rates, failure classification, and action items |
| `/pipeline-health --signoff` | Add GO/NO_GO release verdict to the report |
| `/pipeline-health --signoff AAP-XXXXX` | Post verdict to a JIRA ticket |
| `/pipeline-handoff` | Sprint handoff report with 14-day trends and known failures |
| `/pipeline-triage <spec>` | Deep-dive into a specific test failure |
| `/pipeline-triage <spec> --fix` | Investigate and auto-apply the recommended fix |

## Troubleshooting

**"Set the CURRENTS_PROJECT_ID environment variable"**
You haven't set the project ID. See step 2.

**Currents MCP not connected**
Run `claude mcp list` to check status. If disconnected, verify your API key: `claude mcp get currents`.

**JIRA posting fails**
Ensure the Atlassian MCP is configured and you're authenticated. Run `claude mcp list` to check.

**"No runs found for {version}"**
The nightly pipeline may not have run recently. Try expanding the time window or checking a different version.
