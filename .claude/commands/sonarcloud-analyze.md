# Analyze SonarCloud Issues

Follow **Phase A — Analyze** in `.claude/skills/sonarcloud-remediation.md`.

If the user passes `--help`, display the usage information below and stop.

## Usage

```
/sonarcloud-analyze [options]
```

Fetches all open issues from SonarCloud, groups them by category and workspace, and presents a prioritized summary report.

### Options

| Flag | Description | Example |
|------|-------------|---------|
| `--severity <level>` | Only show issues at or above this severity (BLOCKER, CRITICAL, MAJOR, MINOR, INFO) | `--severity MAJOR` |
| `--workspace <name>` | Only show issues in the specified workspace (AWX, EDA, Hub, Framework, Platform, Common, Chatbot, Tests) | `--workspace AWX` |
| `--help` | Show this usage information | |

### Required Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SONAR_ORGANIZATION` | Yes | SonarCloud organization slug |
| `SONAR_PROJECT_KEY` | Yes | SonarCloud project key |
| `SONARCLOUD_TOKEN` | Only for private projects | API authentication token |

Set them before running:
```bash
export SONAR_ORGANIZATION=your-org
export SONAR_PROJECT_KEY=your-project-key
```

### Output

A prioritized summary table per SonarCloud category:
- **Security** — vulnerabilities
- **Reliability** — bugs
- **Maintainability** — code smells
- **Security Hotspots** — hotspots pending review
- **Duplication** — duplicated blocks and files

Each table groups issues by SonarCloud rule and workspace, sorted by remediation priority, with issue count, severity, and estimated LOC impact.

### Permissions

Add to `.claude/settings.json` to avoid permission prompts:
```json
"Bash(curl -s *sonarcloud.io*)"
```

## Workflow

1. Validate environment variables (`SONAR_ORGANIZATION`, `SONAR_PROJECT_KEY`)
2. Fetch all open issues, hotspots, and duplication metrics from SonarCloud API
3. Categorize by the 5 SonarCloud categories
4. Group by rule + workspace, sort by remediation priority
5. Present a prioritized summary table per category
