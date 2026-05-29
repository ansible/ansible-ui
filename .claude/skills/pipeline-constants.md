# Pipeline Constants

Shared constants used by `pipeline-health.md`, `pipeline-handoff.md`, and `failure-investigator.md`. Update this file when topologies, branches, or thresholds change — all three skills reference it.

---

## Topology Map

Map the topology slug from the `ciBuildId` to a human-readable display name.

| Topology | Display Name |
|----------|-------------|
| `rpm-b`  | RPM B       |
| `saas`   | SaaS        |
| `cont-b` | Container B |
| `ocp-a`  | OCP A       |
| `man-b`  | Managed B   |

**Kubernetes-based topologies:** OCP A, Container B, Managed B. Use this grouping when classifying topology-specific failures (e.g., `KUBERNETES_ONLY` spread).

---

## Branch-to-Version Mapping

| Version | Currents Branch |
|---------|----------------|
| 2.6     | `stable-2.6`   |
| 2.7     | `devel`        |

**Note:** 2.5 builds are not available in this Currents project. If 2.5 is requested, report: "2.5 builds are not available in Currents."

---

## ciBuildId Patterns

Both **Next** and **Stable** (Product) builds report to the same Currents branch. They are distinguished by the `ciBuildId` pattern:

- **Next builds**: `AAP_{version}_Next-Product_Build_CI` (contains `_Next`)
- **Stable builds**: `AAP_{version}-Product_Build_CI` (no `_Next`)

### Full ciBuildId format

**Next:**
```
jenkins-AAPQA-AAP_{version}_Next-Product_Build_CI-tier1-{topology}.fresh-install.ui-playwright-{number}
```

**Stable:**
```
jenkins-AAPQA-AAP_{version}-Product_Build_CI-tier1-{topology}.fresh-install.ui-playwright-{number}
```

Extract from each `ciBuildId`:
- **Build type**: `Next` if the ciBuildId contains `_Next-Product`, otherwise `Stable`
- **Version**: the `{version}` segment (e.g., `2.6`, `2.7`)
- **Topology**: the `{topology}` segment — map to display name using the Topology Map above
- **Build number**: the trailing `{number}`

---

## Classification Thresholds

These thresholds are aligned with `classify_failures.py` (the deterministic classifier). All pipeline skills and the failure-investigator agent must use the same thresholds.

| Classification | Criteria |
|---------------|----------|
| **NEW** | Failure rate < 5% with < 2 failures, OR < 5 executions with failure rate > 50%, OR **regression pattern detected** (was passing in first half of window, started failing in second half) |
| **RECURRING** | Failure rate 5–85%, OR not found in top-50 performance data |
| **CHRONIC** | Failure rate > 85% with 10+ executions |

### Regression detection

The regression pattern compares the first half vs second half of a test's execution history within the look-back window. A test with near-zero failures in the first half but 2+ failures in the second half is classified as **NEW** regardless of its aggregate failure rate.

### Edge cases

- A test with **< 5 total executions** and a high failure rate (> 50%) is classified as **NEW** — it hasn't been running long enough to be chronic.
- A test **not found** in the top-50 performance data defaults to **RECURRING** — we lack enough data to classify it more precisely.

---

## Pass Rate Threshold

**98%** — determines PASS/FAIL status for each run across all pipeline skills.

Formula: `Pass Rate = Passed / Actionable × 100` where `Actionable = Total - Pending`.

---

## Feature Area Mapping

Map spec paths and source paths to feature areas for PR correlation.

| Path Prefix | Area |
|-------------|------|
| `tests/integration/automation-execution/` or `frontend/awx/` | AWX |
| `tests/integration/automation-decisions/` or `frontend/eda/` | EDA |
| `tests/integration/automation-content/` or `frontend/hub/` | Hub |
| `tests/integration/access-management/` or `frontend/common/` | Common |
| `tests/integration/platform/` or `platform/` | Platform |
| `tests/integration/settings/` | Settings/Platform |
| `framework/` | Framework (shared) |
