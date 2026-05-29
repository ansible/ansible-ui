# Pipeline Health Check

Follow the workflow in `.claude/skills/pipeline-health.md`.

If the user passes `--help`, display the usage information below and stop.

## Usage

```
/pipeline-health [version] [next|stable] [--no-trend] [--no-history] [--signoff [AAP-XXXXX]]
```

Queries the Currents dashboard for the latest nightly Jenkins CI runs, analyzes test results across all build topologies, and produces a standup-ready pipeline health report. With `--signoff`, adds a GO/NO_GO release verdict.

### Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `version` | Filter to a specific version (optional — defaults to both 2.6 and 2.7) | `/pipeline-health 2.7` |
| `next` / `stable` | Filter to Next or Stable builds only (optional — defaults to all) | `/pipeline-health 2.7 stable` |
| `--no-trend` | Skip previous-day comparison to reduce API calls (optional) | `/pipeline-health --no-trend` |
| `--no-history` | Skip 7-day failure history lookup (optional) | `/pipeline-health --no-history` |
| `--signoff` | Add GO/NO_GO release verdict (optional — forces stable builds only) | `/pipeline-health 2.7 --signoff` |
| `--signoff AAP-XXXXX` | Add verdict and post to JIRA ticket (optional) | `/pipeline-health 2.7 --signoff AAP-54321` |

### Build Types

- **Next** builds run against branch tips (`stable-2.6`, `stable-2.7`/`devel`)
- **Stable** (Product) builds run against release tags (`2.6.9`, `2.7.0`)
- Both types report to the same Currents branch; they are distinguished by the ciBuildId pattern
- **2.5** builds are not available in Currents

### Signoff Mode

When `--signoff` is passed:
- Forces Stable builds only (same as passing `stable`)
- Skips trend and PR correlation (focuses on verdict)
- Adds a **Release Verdict** section with GO/NO_GO decision
- **GO**: All Stable topologies at or above 98%, no NEW regressions on 2+ topologies
- **NO_GO**: Any topology below 98%, or NEW integration failure on 2+ topologies
- If a JIRA ticket key follows `--signoff`, posts the verdict as a comment on that ticket

### Output

A formatted report including:
- Pass rates per build type (Next/Stable) and version with 98% threshold status
- Release verdict with GO/NO_GO decision (only with `--signoff`)
- Day-over-day pass rate trends per topology (Delta column)
- Failure age classification: NEW (regression), RECURRING (flaky), CHRONIC (known broken)
- Failure × Topology heatmap showing which failures hit which build types
- Priority Ranking table with impact scores to guide fix order
- Recently fixed tests (were broken, now passing)
- Consistent failures across all runs
- New regressions in 2.7 vs 2.6
- Impact-scored action items
