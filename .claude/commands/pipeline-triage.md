# Investigate Test Failure

Spawn the `failure-investigator` agent with the user's arguments. Pass the raw input string as the agent's prompt so it can parse input mode, flags, and identifiers itself.

**Agent prompt template:**
```
Investigate this test failure: $ARGUMENTS

Today's date is {current date in YYYY-MM-DD format}.
Working directory: {current working directory}
```

If the user passes `--help`, display the usage information below and stop (do not spawn the agent).

## Usage

```
/pipeline-triage <spec-name | "test title" | --instance <id> | --run <id> <spec>> [--days <N>] [--fix]
```

Deep-dives into a specific test failure from Currents to determine root cause and suggest remediation. With `--fix`, attempts to auto-apply the recommended fix.

### Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `spec-name` | Spec file name (partial match, most common) | `/pipeline-triage oauth-applications` |
| `"test title"` | Test title (partial match, quoted) | `/pipeline-triage "Inventory Sync"` |
| `--instance <id>` | Currents instance ID (direct lookup) | `/pipeline-triage --instance bb4b5272b262eaac` |
| `--run <id> <spec>` | Run ID + spec name | `/pipeline-triage --run 09581303ff9f7852 oauth-applications` |
| `--days <N>` | Look-back window in days (default: 7) | `/pipeline-triage oauth-applications --days 14` |
| `--fix` | Auto-apply the recommended fix after investigation | `/pipeline-triage oauth-applications --fix` |

### Fix Strategies

When `--fix` is passed, the action depends on the remediation recommendation:

| Recommendation | Auto-Fix Action |
|----------------|-----------------|
| FIX TEST (timeout/assertion) | Stabilize selectors, add waits, or relax assertions in the spec file |
| SKIP | Create a Currents skip action via the API |
| SKIP | Create a Currents skip action via the API |
| FIX PRODUCT | No auto-fix — outputs diagnosis for manual investigation |

### Output

A self-contained investigation report including:
- Test identity (title, spec path, signature)
- Latest failure details (error, stack trace, screenshot, trace, video links)
- Failure timeline with day-by-day pass/fail pattern
- Cross-topology failure spread
- Error pattern consistency analysis
- Classification: NEW (regression), RECURRING (flaky), CHRONIC (known broken)
- Existing skip rules
- Correlated git commits/PRs around first failure date
- Remediation recommendation: FIX TEST / FIX PRODUCT / SKIP
