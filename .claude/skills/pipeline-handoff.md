# Sprint Handoff Report

Produce a sprint handoff report for the incoming rotation engineer. Aggregates pipeline health trends, known failures, and go/no-go decisions from the sprint period.

**Required environment variable:** `CURRENTS_PROJECT_ID` — the Currents project ID. Must be set in your shell or in `.claude/settings.local.json` env config.

---

## 1. Parse Input

Read `CURRENTS_PROJECT_ID` from the environment. If not set, stop and display: "Set the `CURRENTS_PROJECT_ID` environment variable. See `.claude/SETUP.md` for instructions."

- If the user passed a version argument (e.g., `2.7`), set `VERSION_FILTER` to that value.
- If no argument was passed, analyze both versions (2.6 and 2.7).
- If the user passed `--sprint-start <YYYY-MM-DD>`, set `SPRINT_START` to that date in ISO 8601 format.
- If not passed, default to 14 days ago in ISO 8601 format.
- Set `SPRINT_END` to today's date in ISO 8601 format.
- Compute `SPRINT_DAYS` as the number of days between `SPRINT_START` and `SPRINT_END`.

See `.claude/skills/pipeline-constants.md` for branch-to-version mapping, ciBuildId patterns, topology display names, and classification thresholds.

---

## 2. Fetch Sprint Data

Issue all independent API calls in a single parallel batch.

### Parallel Batch 1 — All of the following at once:

**2a. Project Insights (pipeline trend)**

For each branch matching `VERSION_FILTER`, call `currents-get-project-insights` with:
- `projectId`: `${CURRENTS_PROJECT_ID}`
- `date_start`: `SPRINT_START`
- `date_end`: `SPRINT_END`
- `branches`: the branch name
- `resolution`: `1d`

This returns a `timeline` array with daily buckets containing `runs`, `passed`, `failed`, `flaky`, `pending`, `skipped` counts.

**2b. Test Performance (known failures)**

For each branch matching `VERSION_FILTER`, call `currents-get-tests-performance` with:
- `projectId`: `${CURRENTS_PROJECT_ID}`
- `date_start`: `SPRINT_START`
- `date_end`: `SPRINT_END`
- `branches`: the branch name
- `order`: `failures`
- `dir`: `desc`
- `test_state`: `["failed"]`
- `limit`: `50`

**2c. Latest Runs (current snapshot)**

For each branch matching `VERSION_FILTER`, call `currents-get-runs` with:
- `projectId`: `${CURRENTS_PROJECT_ID}`
- `branches`: the branch name
- `completion_state`: `["COMPLETE", "TIMEOUT"]`
- `date_start`: 48 hours ago in ISO 8601
- `limit`: `20`

---

## 3. Parse Latest Runs for Current Snapshot

From the `currents-get-runs` results (Step 2c), parse the ciBuildId of each run to extract build metadata.

Parse each run's `ciBuildId` using the patterns and topology map from `.claude/skills/pipeline-constants.md`. Extract: build type (Next/Stable), version, topology, build number.

### Deduplicate

If multiple runs exist for the same build type + version + topology, keep only the run with the highest build number.

### Fetch Run Details (Parallel Batch 2)

For each deduplicated run, call `currents-get-run-details` with the run's `runId`. Run these in parallel.

Compute per run:

| Metric     | Formula                   |
|------------|---------------------------|
| Total      | Total test count          |
| Passed     | Tests with status passed  |
| Failed     | Tests with status failed  |
| Pending    | Tests with status pending |
| Actionable | Total - Pending           |
| Pass Rate  | Passed / Actionable * 100 |

The **98% threshold** determines PASS/FAIL status.

---

## 4. Classify Known Failures

From the `currents-get-tests-performance` results (Step 2b), classify each failing test.

### Classify Age

Use the classification script (same as pipeline-health Step 5c.3):

```bash
python3 .claude/skills/scripts/classify_failures.py \
  --performance performance.json \
  --failures failure-titles.json \
  --output classified.json
```

See `pipeline-health.md` Step 5c for full details on input preparation. The script detects regression patterns (was-passing-now-failing) and classifies each test as NEW, RECURRING, or CHRONIC.

### Cross-Reference with Open PRs

For the top 5 chronic/recurring failures (by failure count), attempt to find open PRs that address them:

```bash
gh pr list --repo ansible/ansible-ui --state open --search "<spec-file-name>" --json number,title,url --limit 3
```

If a matching open PR is found, record its number for the report. This is best-effort — no match means `—` in the Active PR column.

---

## 6. Generate Report

Output the report in this exact format:

```
## Sprint Handoff Report — {SPRINT_START} to {SPRINT_END}

**Sprint duration:** {SPRINT_DAYS} days
**Versions:** {VERSION_FILTER or "2.6, 2.7"}
```

### Sprint Summary

Generate a 2-3 sentence overview covering:
1. Overall pipeline health trajectory — did pass rates improve, degrade, or hold steady over the sprint?
2. The biggest issue or blocker during the sprint period.
3. Key accomplishment or resolution if any (e.g., "Flaky test PR merged, eliminating N failures").

Derive the trend by comparing average pass rate in the first half of the sprint vs the second half (from project-insights timeline data).

### Pipeline Trend

For each version, output a daily pass rate table from the project-insights timeline data:

```
### Pipeline Trend ({SPRINT_DAYS} Days)

#### 2.7 (devel)

| Date   | Runs | Pass Rate | Failed | Flaky |
|--------|------|-----------|--------|-------|
| May 28 | 3    | 95.8%     | 19     | 4     |
| May 27 | 5    | 95.4%     | 21     | 5     |
| ...    | ...  | ...       | ...    | ...   |

**Trend:** Average pass rate moved from {first-half-avg}% (week 1) to {second-half-avg}% (week 2). {improving/degrading/stable}.
```

Compute pass rate per day: `passed / (passed + failed) * 100`. Omit days with 0 runs.

Trend direction: "improving" if second-half avg > first-half avg by > 0.5pp. "degrading" if lower by > 0.5pp. "stable" otherwise.

### Current Pipeline Snapshot

For each build type + version combination with runs in the last 48 hours, output a table. Order: 2.6 Stable, 2.6 Next, 2.7 Stable, 2.7 Next.

```
### Current Pipeline Snapshot

#### {version} {type} ({branch})

| Topology    | Pass Rate          | Failures | Status |
|-------------|--------------------|----------|--------|
| SaaS        | 98.61% (461/474)   | 6        | PASS   |
| OCP A       | 97.45% (380/390)   | 10       | FAIL   |

_Threshold: 98%. Data from last 48 hours._
```

If no runs found for a build type + version, note: "No recent runs found."

### Known Failures & Open Issues

Show top failures from the sprint period, sorted by failure count descending.

```
### Known Failures & Open Issues

| # | Test | Spec | Failure Rate | Executions | Age | Active PR |
|---|------|------|-------------|------------|-----|-----------|
| 1 | jobs: inventory sync timeout | jobs.spec.ts | 100% | 18 | CHRONIC | — |
| 2 | ... | ... | ... | ... | ... | ... |

_{N} chronic, {M} recurring, {P} new failures across the sprint.
```

Limit to top 20 failures to keep the report scannable. Show the spec file name without the full path (e.g., `jobs.spec.ts` not `tests/integration/.../jobs.spec.ts`).

### Action Items for Next Engineer

Generate a prioritized list derived from all the data collected:

```
### Action Items for Next Engineer

1. **Investigate {test/spec}** — {failure rate}% failure rate across the sprint, {age}. Use `/pipeline-triage {spec}`.
2. **Skip chronic failures** — {N} chronic failures across all topologies. Run `/pipeline-triage {spec} --fix`.
3. **Monitor {version} trend** — pass rates {trending direction} over the last week. {specific concern}.
4. **{Any other item from upcoming milestones or sprint context}**
```

Rules for generating action items:
- Chronic failures come first — prioritize by failure count.
- Trend concerns only if pass rates are degrading (> 0.5pp drop week-over-week).
- Limit to 5-7 action items. More than that is not actionable.

---

## Report Rules

- **Status**: `PASS` if pass rate >= 98%, `FAIL` if below
- **Pass Rate**: Show as percentage with fraction in parentheses, e.g., `98.61% (461/474)`
- **Topology display names**: See `.claude/skills/pipeline-constants.md`
- **Age tags**: `NEW`, `RECURRING`, `CHRONIC` — same thresholds as pipeline-health
- **Date format**: "May 22" in tables for readability, YYYY-MM-DD in headers
- **Active PR column**: PR number if found, `—` otherwise
- **Trend direction**: "improving" if second-half avg > first-half avg by > 0.5pp, "degrading" if lower by > 0.5pp, "stable" otherwise
- If only one version requested, omit the other version's sections
- Keep the report under ~200 lines for 5-minute readability
