# Analyze SonarCloud Issues

Follow **Phase A — Analyze** in `.claude/skills/sonarcloud-remediation/sonarcloud-remediation.md`.

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
| `--module <name>` | Only show issues in the specified module (auto-detected from repo structure — see skill docs) | `--module frontend/awx` |
| `--help` | Show this usage information | |

### Environment Variables

All variables can be set beforehand **or** provided interactively when the command starts, **except `SONARCLOUD_TOKEN`** which must always be set as an environment variable.

| Variable | When needed | Purpose |
|----------|-------------|---------|
| `SONAR_BASE_URL` | Optional | Base URL of the Sonar API. Defaults to `https://sonarcloud.io/api`. Set for self-hosted SonarQube. |
| `SONAR_ORGANIZATION` | Phase A, B | SonarCloud organization slug. **Required for SonarCloud; optional for self-hosted SonarQube.** |
| `SONAR_PROJECT_KEY` | Phase A, B | Sonar project key |
| `SONARCLOUD_TOKEN` | Private projects only | API token. **Must be set as an environment variable before starting Claude** — never provided interactively. |

### Output

A prioritized summary table per SonarCloud category:
- **Security** — vulnerabilities
- **Reliability** — bugs
- **Maintainability** — code smells
- **Security Hotspots** — hotspots pending review
- **Duplication** — duplicated blocks and files

Each table groups issues by SonarCloud rule and module (auto-detected from workspace definitions or top-level directories), sorted by remediation priority, with issue count, severity, and estimated LOC impact.

### Permissions

Add to `.claude/settings.json` to avoid permission prompts:
```json
"Bash(python3 *sonarcloud-fetch.py*)"
```

## Workflow

1. Run the fetch script (`scripts/sonarcloud-fetch.py`) to fetch and categorize all issues
2. Detect modules (from workspace definitions or top-level directories), group by rule + module, sort by remediation priority
3. Present a prioritized summary table per category
