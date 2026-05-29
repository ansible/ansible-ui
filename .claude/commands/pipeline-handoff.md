# Sprint Handoff Report

Follow the workflow in `.claude/skills/pipeline-handoff.md`.

If the user passes `--help`, display the usage information below and stop.

## Usage

```
/pipeline-handoff [version] [--sprint-start <YYYY-MM-DD>]
```

Produces a sprint handoff report for the incoming rotation engineer. Aggregates 2-week pipeline health trends from Currents, known failures, and Jira go/no-go decisions into a scannable report.

### Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `version` | Filter to a specific version (optional — defaults to both 2.6 and 2.7) | `/pipeline-handoff 2.7` |
| `--sprint-start <date>` | Sprint start date in YYYY-MM-DD (optional — defaults to 14 days ago) | `/pipeline-handoff --sprint-start 2026-05-14` |

### Output

A formatted handoff report including:
- Sprint summary with pipeline health trajectory
- 14-day pass rate trend per version (daily breakdown)
- Current pipeline snapshot with per-topology pass rates
- Known failures classified by age (NEW/RECURRING/CHRONIC)
- Prioritized action items for the incoming engineer
