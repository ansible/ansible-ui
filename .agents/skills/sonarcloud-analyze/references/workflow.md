---
name: sonarcloud-analyze
description: >-
  Analyze and group SonarCloud or SonarQube issues by rule and workspace.
---

# Analyze SonarCloud Issues

Follow **Phase A — Analyze** in [SonarCloud remediation guide](../../sonarcloud-remediation/references/sonarcloud-remediation.md).

If the user asks for help, display the usage information below and stop.

## How to use

Fetch open issues from SonarCloud or SonarQube, group them by category and workspace, and present a prioritized summary report.

### Options

| Flag | Description | Example |
|------|-------------|---------|
| `--severity <level>` | Only show issues at or above this severity (BLOCKER, CRITICAL, MAJOR, MINOR, INFO) | `--severity MAJOR` |
| `--module <name>` | Only show issues in the specified module (auto-detected from repo structure — see skill docs) | `--module frontend/awx` |
| `--help` | Show this usage information | |

### Environment Variables

Set variables beforehand **or** provide them interactively when the skill starts, **except `SONARCLOUD_TOKEN`** which must always be set as an environment variable.

| Variable | When needed | Purpose |
|----------|-------------|---------|
| `SONAR_BASE_URL` | Optional | Base URL of the Sonar API. Defaults to `https://sonarcloud.io/api`. Set for self-hosted SonarQube. |
| `SONAR_ORGANIZATION` | Phase A, B | SonarCloud organization slug. **Required for SonarCloud; optional for self-hosted SonarQube.** |
| `SONAR_PROJECT_KEY` | Phase A, B | Sonar project key |
| `SONARCLOUD_TOKEN` | Private projects only | API token. **Must be set as an environment variable before starting the agent session** — never provided interactively. |

### Output

A prioritized summary table per SonarCloud category:
- **Security** — vulnerabilities
- **Reliability** — bugs
- **Maintainability** — code smells
- **Security Hotspots** — hotspots pending review
- **Duplication** — duplicated blocks and files

Each table groups issues by SonarCloud rule and module (auto-detected from workspace definitions or top-level directories), sorted by remediation priority, with issue count, severity, and estimated LOC impact.

### Permissions

Allow the local agent environment to run the Python helper when needed. Do not
commit local tool settings or credentials.
