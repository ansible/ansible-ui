# Analyze SonarCloud Issues

Follow **Phase A — Analyze** in `.claude/skills/sonarcloud-remediation.md`.

1. Validate environment variables (`SONAR_ORGANIZATION`, `SONAR_PROJECT_KEY`)
2. Fetch all open issues, hotspots, and duplication metrics from SonarCloud API
3. Categorize by the 5 SonarCloud categories (Security, Reliability, Maintainability, Security Hotspots, Duplication)
4. Group by rule + workspace, sort by remediation priority
5. Present a prioritized summary table per category

Optional arguments: `--severity <level>`, `--workspace <name>`
