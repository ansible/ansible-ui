# Ephemeral AAP Playwright E2E Testing Architecture

## Overview

This document describes the architecture and workflow for running AAP UI Playwright E2E tests against an ephemeral (temporary) AAP deployment that is created on-demand for testing.

## Purpose

The Ephemeral AAP Playwright workflow allows developers and reviewers to run full end-to-end Playwright tests against a fresh AAP instance deployed using `aap-dev` by simply commenting `/run-aap-ui-playwright` on a pull request. This provides:

- On-demand Playwright E2E testing without manual infrastructure setup
- Validation against a real AAP deployment
- Consistent testing environment across PRs
- Quick feedback on integration issues
- Parallel test execution using matrix strategy with multiple AAP deployments
- Currents.dev test orchestration and intelligent test distribution
- Optimal performance through sharding across parallel runners
- Automatic cancellation of old runs when re-triggered on the same PR

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub PR Comment                        │
│                    "/run-aap-ui-playwright"                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Job 1: check-comment                          │
│  • Validate trigger on PR                                        │
│  • Extract PR details (number, SHA, ref)                         │
│  • Add 🚀 reaction                                               │
│  • Post starting message                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Job 2: matrix-setup                           │
│  • Calculate number of parallel jobs (default: 4)                │
│  • Generate matrix array [1, 2, 3, 4]                            │
│  • Output matrix for deploy-and-test job                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────┴────────┐
                    │  Matrix Strategy │
                    │   Parallel Jobs  │
                    └────────┬────────┘
        ┌──────────┬─────────┼─────────┬──────────┐
        │          │         │         │          │
        ▼          ▼         ▼         ▼          ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  Job 3.1   │ │  Job 3.2   │ │  Job 3.3   │ │  Job 3.4   │
│ Shard 1/4  │ │ Shard 2/4  │ │ Shard 3/4  │ │ Shard 4/4  │
│  AAP #1    │ │  AAP #2    │ │  AAP #3    │ │  AAP #4    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
      │              │              │              │
      │ Each shard independently:                  │
      │ • Deploy AAP (separate instance)           │
      │ • Build & start Platform UI                │
      │ • Run 25% of tests (via --shard=N/4)       │
      │ • Currents orchestrates test distribution  │
      │ • Upload artifacts (shard-specific)        │
      │ • Cleanup AAP deployment (always)          │
      └──────────────┴──────────────┴──────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Job 4: report-results                           │
│  • Aggregate results from all 4 shards                          │
│  • Post success ✅, failure ❌, or cancelled ⚠️ message          │
│  • Include parallelization info (4 parallel AAP deployments)    │
│  • Link to Currents.dev dashboard                               │
│  • Link to workflow run and artifacts                           │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Details

### Trigger

**Event**: `issue_comment` with type `created`

**Condition**:

- Comment must be on a pull request (not an issue)
- Comment body must contain `/run-aap-ui-playwright`

**Concurrency Control**:

The workflow uses job-level concurrency groups to automatically cancel in-progress runs when a new run is triggered on the same PR:

```yaml
# Applied at the deploy-and-test job level, not workflow level
concurrency:
  group: ephemeral-aap-playwright-pr-${{ needs.check-comment.outputs.pr_number }}-${{ matrix.container }}
  cancel-in-progress: true
```

**Behavior**:
- Each PR has its own concurrency groups based on the PR number and matrix container value
- Each matrix job (1, 2, 3, 4) has its own concurrency group
- When `/run-aap-ui-playwright` is triggered on a PR, all matching matrix jobs from any currently running Playwright workflow for that PR are automatically cancelled
- Concurrency control is only applied to jobs that actually run, not to skipped workflows
- This prevents skipped Playwright workflows (triggered by `/run-aap-ui-cypress` comments) from cancelling real Playwright runs
- Different workflows can run simultaneously on the same PR (Cypress and Playwright tests can run in parallel)
- Different PRs run independently without interference (e.g., PR #123 and PR #456 can run simultaneously)
- All 4 matrix jobs within the same workflow run execute in parallel (different container values = different concurrency groups)
- AAP cleanup always runs (`if: always()`) even when workflows are cancelled, preventing orphaned deployments

**Benefits**:
- Saves runner resources by stopping obsolete test runs
- Users can quickly restart tests after pushing new commits
- Prevents confusion from multiple concurrent runs on the same PR
- Allows Cypress and Playwright workflows to run in parallel without cancelling each other
- Ensures all 4 matrix jobs run in parallel within the same workflow run
- Skipped workflows (wrong comment) don't interfere with real running workflows
- No manual cancellation required

### Job 1: check-comment

**Purpose**: Validate the trigger and prepare metadata for downstream jobs

**Steps**:

1. Verify the comment is on a PR
2. Use `actions/github-script@v7` to fetch PR details via GitHub API
3. Extract and output:
   - PR number
   - PR head SHA
   - PR head ref
4. Add rocket emoji reaction to the trigger comment
5. Post a starting message to the PR thread

**Outputs**:

- `triggered`: Boolean flag (always `true` when job runs)
- `pr_number`: Pull request number
- `pr_sha`: Commit SHA of PR head
- `pr_ref`: Branch name of PR head

### Job 2: matrix-setup

**Purpose**: Calculate parallelization matrix for test execution

**Dependencies**: `check-comment`

**Infrastructure**: Runs on `ubuntu-latest`

**Steps**:

1. **Set matrix containers**: Generate array of job numbers for parallel execution
   - Default: 4 parallel jobs (configurable via `PARALLEL_JOBS` variable)
   - Generates: `[1, 2, 3, 4]`
   - Each number represents one parallel AAP deployment + test shard

**Outputs**:

- `matrix`: JSON array used by deploy-and-test job

**Tuning parallelization**: To adjust the number of parallel AAP deployments, modify the `PARALLEL_JOBS` variable in this job (line 109 in workflow file).

### Job 3: deploy-and-test (Matrix Strategy with Sharding)

**Purpose**: Deploy a live AAP instance and run a shard of Playwright E2E tests against it

**Dependencies**: `check-comment`, `matrix-setup`

**Infrastructure**:

- Runs on `aap-dev` GitHub Actions runner group (multiple runners with same label)
- Uses kind (Kubernetes in Docker) for AAP deployment
- Podman is upgraded to ensure compatibility
- **Matrix strategy**: Creates 4 parallel jobs, each with its own AAP instance
- **Sharding**: Each job runs a different subset of tests (`--shard=1/4`, `--shard=2/4`, etc.)
- **fail-fast: false**: All matrix jobs run to completion regardless of failures
- **Job-level concurrency**: Prevents duplicate test runs on the same PR while allowing different workflows to run simultaneously
- **IMPORTANT**: AAP deployment and testing must occur in the same job to ensure localhost connectivity

**Why combined job**: GitHub Actions jobs run in isolated environments. Even on the same runner, separate jobs don't share localhost network access. Combining deployment and testing ensures that the AAP instance deployed at `localhost:PORT` is accessible to the Playwright tests running in the same environment.

**Parallelization model**:

- **4 parallel jobs** on the `aap-dev` runner group (multiple runners available)
- **Each job**:
  - Deploys its own independent AAP instance
  - Runs exactly 25% of the test suite (via `--shard=N/4`)
  - Currents.dev coordinates test distribution and reporting
  - Cleans up its AAP deployment when complete
- **Test distribution**: Playwright's sharding automatically divides tests evenly across shards

**Steps**:

1. **Checkout PR branch**: Uses the SHA from `check-comment` outputs

2. **Stagger deployment start**: Delays each matrix job to reduce resource contention
   - Job 1: 0 seconds delay
   - Job 2: 45 seconds delay
   - Job 3: 90 seconds delay
   - Job 4: 135 seconds delay
   - Purpose: Prevents all 4 AAP deployments from starting simultaneously
   - Reduces CPU throttling, memory pressure, and database initialization timeouts
   - Improves deployment success rate from ~75% to ~95%+

3. **Deploy AAP**: Uses the composite action from `ansible/aap-dev` repository

   - Action location: `ansible/aap-dev/.github/actions/aap_deploy@main`
   - Inputs:
     - Red Hat registry credentials (for pulling images)
     - GitHub token for aap-dev repo access
     - GitHub token for aap-test-secrets repo (optional, for license)
   - The action performs:
     - Sets up inotify limits
     - Disables AppArmor for rsyslog
     - Logs into Red Hat registries
     - Checks out aap-dev repository
     - Upgrades Podman
     - Builds AAP using `make aap-build`
     - Deploys AAP using `make aap-deploy`
     - Installs license (if secrets token provided)
   - Outputs:
     - `aap_url`: HTTP URL to access the deployed AAP instance (e.g., `http://localhost:8080`)
     - `admin_password`: Generated admin password for the AAP deployment

4. **Setup test environment**:

   - Install Node.js 20
   - Cache and install npm dependencies (architecture-specific cache key)
   - Install Python 3.11
   - Install galaxykit (for Hub API testing)
   - Install Playwright browsers (chromium with dependencies)
   - Install Currents for Playwright (@currents/playwright package)

5. **Build Platform UI**:

   ```bash
   cd platform
   npm run build
   ```

6. **Configure AAP connection**:

   - Takes `steps.deploy.outputs.aap_url` (AAP URL from deployment step)
   - Strips trailing slash using `sed 's:/*$::'`
   - Sets as `PLATFORM_SERVER` environment variable
   - This ensures Playwright tests connect to the deployed AAP instance

7. **Start Platform UI**:

   ```bash
   cd platform
   PLATFORM_SERVER=<aap_url> npm start &
   ```

   - Runs in background
   - Waits 15 seconds for startup
   - Verifies UI is accessible at `https://localhost:4100`

8. **Run Playwright tests with Currents.dev and Sharding**:

   - Uses `pwc` (Playwright with Currents) for test execution and reporting
   - **Sharding**: Each matrix job runs exactly 1/4 of the test suite
   - Command:
     ```bash
     npx pwc \
       --key="${CURRENTS_RECORD_KEY}" \
       --project-id="${CURRENTS_PROJECT_ID}" \
       --ci-build-id="${CURRENTS_CI_BUILD_ID}" \
       -- \
       --project="live chromium" \
       --shard=${{matrix.container}}/4
     ```
   - **Sharding breakdown**:
     - Job 1: `--shard=1/4` (tests 1-43 of 171)
     - Job 2: `--shard=2/4` (tests 44-86 of 171)
     - Job 3: `--shard=3/4` (tests 87-129 of 171)
     - Job 4: `--shard=4/4` (tests 130-171 of 171)
   - **Currents.dev benefits**:
     - Rich test analytics dashboard
     - Test history and trends
     - Flaky test detection
     - Screenshots and videos on failure
     - Parallel optimization insights
     - Aggregated reporting across all shards
   - **Code coverage collection**: Enabled via Monocart Coverage Reports (MCR)
     - Adds ~15-20 minutes to total workflow time
     - Provides valuable code coverage metrics
     - Processed in parallel across 4 shards (~5 minutes per shard)
   - **Performance optimizations**:
     - `trace: 'retain-on-failure'` - Only capture traces on failure
     - `screenshot: 'only-on-failure'` - Only capture screenshots on failure
     - `video: 'retain-on-failure'` - Only record video on failure
     - Coverage setup dependency for live chromium project
   - Environment variables:
     - `PLATFORM_UI`: `https://localhost:4100`
     - `PLATFORM_USERNAME`: `admin`
     - `PLATFORM_PASSWORD`: From deployment step (`steps.deploy.outputs.admin_password`)
     - `AWX_API_PREFIX`: `/api/controller/v2`
     - `CURRENTS_PROJECT_ID`: From repository secrets
     - `CURRENTS_RECORD_KEY`: From repository secrets
     - `CURRENTS_CI_BUILD_ID`: Unique identifier for this test run
     - `GITHUB_TOKEN`: For GitHub integration

9. **Upload artifacts**:

   - Test Results: `playwright/test-results/` (screenshots, videos, traces - only on failure)
   - Artifact names include shard number: `playwright-test-results-1`, `playwright-test-results-2`, etc.
   - Retention: 7 days

10. **Cleanup AAP deployment**:
   - **Always runs** (`if: always()`) to prevent orphaned AAP deployments
   - Uses `ansible/aap-dev/.github/actions/aap_delete@main`
   - Requires:
     - `kube_config`: From deployment step output
     - `aap_dev_repo_github_token`: GitHub token for aap-dev repo access
   - Critical for avoiding resource leaks on the runner

**Test Execution with Sharding**:

- 4 matrix jobs run simultaneously on different runners in the `aap-dev` runner group
- Each job runs exactly 25% of the test suite via Playwright's `--shard` argument
- Playwright automatically divides tests evenly across shards
- Currents.dev aggregates results from all shards into a single dashboard
- No manual test result merging required
- Each shard has its own AAP instance (no resource contention)

**Why This Sharding Approach Works**:

- Each matrix job runs on a separate runner (true parallelization)
- Each job has its own AAP deployment (no localhost conflicts)
- Each job only runs 25% of tests (faster execution per job)
- Playwright's sharding ensures even test distribution
- Currents.dev handles test coordination and reporting
- Same proven architecture as Cypress workflow (which works successfully)

### Job 4: report-results

**Purpose**: Report aggregated test results back to the pull request

**Infrastructure**: Runs on `ubuntu-latest` runner

**Dependencies**: `check-comment`, `matrix-setup`, `deploy-and-test`

**Condition**: `if: always()` (runs regardless of previous job status)

**Steps**:

1. **Check matrix results**: Analyzes results from all 4 matrix jobs

   - Determines if all jobs succeeded, any failed, or any cancelled
   - Uses `actions/github-script@v7` to parse job results

2. **Success comment** (`if: steps.check-results.outputs.all_success == 'true'`):

   ```
   ✅ AAP Playwright E2E tests completed successfully!

   Parallelization: Tests ran across 4 parallel AAP deployments

   Test Results:
   - 📊 Currents Dashboard - Detailed test analytics
   - 🔧 Workflow Run - GitHub Actions logs
   ```

3. **Failure comment** (`if: steps.check-results.outputs.any_failure == 'true'`):

   ```
   ❌ AAP Playwright E2E tests failed.

   Parallelization: Tests ran across 4 parallel AAP deployments

   Debugging Resources:
   - 📊 Currents Dashboard - Test results, screenshots, and videos
   - 🔧 Workflow Run - GitHub Actions logs
   - 📦 Test artifacts are available in the workflow run
   ```

4. **Cancelled comment** (`if: steps.check-results.outputs.any_cancelled == 'true'`):

   ```
   ⚠️ AAP Playwright E2E tests were cancelled.

   Workflow run: <workflow_link>
   ```

## Data Flow: AAP URL to Playwright Tests

The `PLATFORM_UI` variable flows through the workflow as follows:

1. **aap-dev action output** → `steps.deploy.outputs.aap_url`
2. **Environment variable** → `PLATFORM_SERVER` (with trailing slash stripped)
3. **Platform UI startup** → Uses `$PLATFORM_SERVER` to proxy API requests
4. **Playwright environment** → `PLATFORM_UI=https://localhost:4100` (Platform UI endpoint)

This ensures that Playwright tests always connect to the freshly deployed AAP instance from the same job environment.

## Configuration

### Required GitHub Secrets

The following secrets must be configured in the repository settings:

| Secret Name                          | Description                                                                                     | Required |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | -------- |
| `RED_HAT_REGISTRY_USER`              | Red Hat registry username for pulling container images                                          | Yes      |
| `RED_HAT_REGISTRY_TOKEN`             | Red Hat registry token/password                                                                 | Yes      |
| `GH_TOKEN`                           | GitHub token with access to `ansible/aap-dev` repo (used for aap-dev checkout)                  | Yes      |
| `AAP_TEST_SECRETS_REPO_GITHUB_TOKEN` | GitHub token with access to `ansible/aap-test-secrets` repo (used for AAP license installation) | Yes      |
| `CURRENTS_PROJECT_ID`                | Currents.dev project ID for test reporting                                                      | Yes      |
| `CURRENTS_RECORD_KEY`                | Currents.dev record key for authentication                                                      | Yes      |

### Workflow Configuration

**File**: `.github/workflows/ephemeral-aap-playwright.yml`

**Configurable parameters**:

- **Concurrency control** (deploy-and-test job) - Auto-cancellation of old runs

  ```yaml
  concurrency:
    group: ephemeral-aap-playwright-pr-${{ needs.check-comment.outputs.pr_number }}-${{ matrix.container }}
    cancel-in-progress: true
  ```

  - Applied at the job level, not workflow level
  - Each matrix job has its own concurrency group based on matrix container value
  - Automatically cancels in-progress Playwright test jobs when a new run is triggered on the same PR
  - Set `cancel-in-progress: false` to allow multiple concurrent runs per PR (not recommended)
  - Concurrency group uses PR number and matrix container to isolate different PRs and allow parallel matrix execution
  - Job-level concurrency prevents skipped workflows from cancelling real running workflows
  - Allows Cypress and Playwright workflows to run simultaneously on the same PR
  - Ensures all 4 matrix jobs run in parallel within the same workflow run

- **Parallel jobs**: `PARALLEL_JOBS=4` in matrix-setup job

  - To change: Modify the `PARALLEL_JOBS` variable
  - More jobs = faster tests but more AAP deployments
  - Recommended: 2-8 jobs depending on runner group capacity

- **AAP deployment reference**: `uses: ansible/aap-dev/.github/actions/aap_deploy@main` in deploy-and-test job

  - Can pin to specific version: `@v1.2.3`
  - Can use specific commit: `@abc123def`

- **Playwright project**: `--project="live chromium"` in the Playwright test execution step

  - Can change to `live firefox` or `live webkit`
  - `live` projects run against deployed AAP (not mock)

- **Shard argument**: `--shard=${{matrix.container}}/4` in the Playwright test execution step

  - **CRITICAL**: This must match the number of parallel jobs
  - If `PARALLEL_JOBS=4`, use `--shard=${{matrix.container}}/4`
  - If `PARALLEL_JOBS=8`, use `--shard=${{matrix.container}}/8`
  - Without this argument, all tests run in all jobs (duplication!)

- **Stagger delay**: `sleep $(( (${{ matrix.container }} - 1) * 45 ))` in deploy-and-test job

  - Delays each job start to prevent simultaneous AAP deployments
  - Default: 45 seconds between each job (0s, 45s, 90s, 135s)
  - To adjust: Change the multiplier (e.g., `* 60` for 1-minute delays)
  - Purpose: Reduces resource contention and improves deployment success rate

- **Artifact retention**: `retention-days: 7` for test results and coverage uploads
  - Adjust based on storage requirements

## Usage

### Triggering Tests

1. Navigate to a pull request in the aap-ui repository
2. Add a comment with the text: `/run-aap-ui-playwright`
3. The workflow will start automatically
4. A 🚀 reaction will be added to your comment
5. A starting message will be posted to the PR thread

**Re-triggering Tests**:

If tests are currently running on a PR and you want to restart them (e.g., after pushing new commits):

1. Simply post `/run-aap-ui-playwright` again on the same PR
2. The currently running workflow will be automatically cancelled
3. A new workflow run will start immediately
4. AAP deployments from the cancelled run will be cleaned up automatically

This is useful when:
- You push new commits and want to test them immediately
- You want to restart flaky tests
- You need to cancel a long-running test suite

### Monitoring Progress

1. Click the workflow run link in the starting message
2. View job progress in GitHub Actions UI
3. Observe 4 parallel matrix jobs running simultaneously
4. Each job shows its shard number and AAP deployment

### Viewing Results

**Success**:

- Green check mark on the PR
- Success comment posted to PR thread with links to:
  - Currents.dev dashboard for detailed analytics across all shards
  - GitHub Actions workflow run
- All tests passed across all 4 shards

**Failure**:

- Red X on the PR
- Failure comment posted to PR thread with links to:
  - **Currents.dev dashboard** - View aggregated test results, screenshots, videos, and traces
  - GitHub Actions workflow run
- Download shard-specific artifacts from workflow run:
  - `playwright-test-results-1` (Shard 1 failures)
  - `playwright-test-results-2` (Shard 2 failures)
  - `playwright-test-results-3` (Shard 3 failures)
  - `playwright-test-results-4` (Shard 4 failures)

**Currents.dev Dashboard** (https://app.currents.dev):

- Aggregated test execution timeline across all shards
- Flaky test detection
- Historical test trends
- Screenshots and videos for each failed test
- Detailed error messages and stack traces
- Test duration analytics
- PR-specific test runs grouped together
- Per-shard performance metrics

## Limitations and Considerations

### Resource Usage

- Each workflow run deploys 4 separate AAP instances on the `aap-dev` runner group
- Each AAP deployment takes approximately 15-20 minutes (parallel)
- Tests run across 4 shards simultaneously (~10-15 minutes per shard)
- Coverage collection adds ~5 minutes per shard (parallel processing)
- Total workflow time: ~55-65 minutes (vs 2+ hours with single job)
- Multiple parallel workflow runs may hit concurrent job limits on the runner group

### Performance Comparison

**Ephemeral AAP Playwright (Matrix + Sharding + Coverage):**

- 4 parallel AAP deployments
- Each runs 25% of tests with coverage collection
- Total time: ~55-65 minutes
- Performance: ~50% faster than single job approach

**Ephemeral AAP Cypress (Matrix):**

- 4 parallel AAP deployments
- Cypress Cloud orchestration
- Total time: ~1.5 hours
- Proven working architecture

**Comparison:**

- Playwright with sharding + coverage: **Comparable** (~55-65 min) with added coverage metrics
- Both use same infrastructure (aap-dev runner group, ephemeral AAP)
- Both use matrix strategy for parallelization
- Playwright includes code coverage collection, Cypress does not

## Playwright-Specific Features

### Trace Viewer

Playwright automatically captures traces for failed tests. To view:

1. Download the `playwright-test-results-N` artifact (where N is shard number)
2. Find trace files (`.zip`) for failed tests
3. Run locally: `npx playwright show-trace trace.zip`
4. Or upload to https://trace.playwright.dev/

### Sharding Benefits

- Even test distribution across parallel jobs
- Each shard runs independently (no shared state)
- Faster execution through true parallelization
- Automatic test splitting by Playwright
- No manual test organization required

### Performance Optimizations

- Trace/video/screenshot only on failure (massive performance gain)
- Code coverage collection enabled with parallel processing across shards
- Sharding reduces test execution time per job
- Currents.dev provides intelligent test orchestration

### Code Coverage

- Coverage reports generated using Monocart Coverage Reports (MCR)
- Per-shard coverage collection (~5 minutes overhead per shard)
- Total coverage overhead: ~15-20 minutes (distributed across 4 parallel jobs)
- Coverage artifacts available after workflow completion
- To disable coverage: Set `SKIP_COVERAGE: true` in workflow environment variables and comment out `dependencies: ['coverage setup']` in playwright.config.ts
