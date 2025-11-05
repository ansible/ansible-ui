# Ephemeral AAP Cypress Testing Architecture

## Overview

This document describes the architecture and workflow for running AAP UI E2E tests against an ephemeral (temporary) AAP deployment that is created on-demand for testing.

## Purpose

The Ephemeral AAP Cypress workflow allows developers and reviewers to run full end-to-end Cypress tests against a fresh AAP instance deployed using `aap-dev` by simply commenting `/run-aap-ui-cypress` on a pull request. This provides:

- On-demand E2E testing without manual infrastructure setup
- Validation against a real AAP deployment
- Consistent testing environment across PRs
- Quick feedback on integration issues

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub PR Comment                        │
│                      "/run-aap-ui-cypress"                       │
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
│  AAP #1    │ │  AAP #2    │ │  AAP #3    │ │  AAP #4    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
      │              │              │              │
      │ Each job independently:                    │
      │ • Deploy AAP (separate instance)           │
      │ • Build & start Platform UI                │
      │ • Run Cypress tests (parallel mode)        │
      │ • Upload artifacts (matrix-specific)       │
      │ • Cleanup AAP deployment (always)          │
      └──────────────┴──────────────┴──────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Job 4: report-results                           │
│  • Aggregate results from all matrix jobs                       │
│  • Post success ✅, failure ❌, or cancelled ⚠️ message          │
│  • Include parallelization info (N jobs)                         │
│  • Include workflow run link                                     │
│  • Reference test artifacts                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Details

### Trigger

**Event**: `issue_comment` with type `created`

**Condition**:

- Comment must be on a pull request (not an issue)
- Comment body must contain `/run-aap-ui-cypress`
- Optional: AAP version can be specified after the command (e.g., `/run-aap-ui-cypress 2.5-next`)
- Default: AAP version 2.6 is used if not specified

**Concurrency Control**:

- **Location**: Applied at the job level (deploy-and-test job only)
- **Group**: `ephemeral-aap-cypress-pr-{PR_NUMBER}-{MATRIX_CONTAINER}`
- **Cancel in progress**: `true`
- Each matrix job (1, 2, 3, 4) has its own concurrency group based on the matrix container value
- If a new Cypress test run is triggered while one is already running for the same PR, all matching matrix jobs from the old run are automatically cancelled
- Concurrency control is **version-agnostic**: triggering with a different AAP version cancels previous runs
- This prevents wasting resources on outdated test runs
- Concurrency control is only applied to jobs that actually run, not to skipped workflows
- This prevents skipped Cypress workflows (triggered by `/run-aap-ui-playwright` comments) from cancelling real Cypress runs
- Different workflows can run simultaneously on the same PR (Cypress and Playwright tests can run in parallel)
- Cleanup steps still execute on cancelled workflows to tear down AAP deployments

### Job 1: check-comment

**Purpose**: Validate the trigger and prepare metadata for downstream jobs

**Steps**:

1. Verify the comment is on a PR
2. Use `actions/github-script@v7` to fetch PR details via GitHub API
3. Extract and output:
   - PR number
   - PR head SHA
   - PR head ref
   - AAP version (parsed from comment, defaults to `2.6`)
4. Add rocket emoji reaction to the trigger comment
5. Post a starting message to the PR thread (includes AAP version being deployed)

**Outputs**:

- `triggered`: Boolean flag (always `true` when job runs)
- `pr_number`: Pull request number
- `pr_sha`: Commit SHA of PR head
- `pr_ref`: Branch name of PR head
- `aap_version`: AAP version to deploy (parsed from comment or default `2.6`)

### Job 2: matrix-setup

**Purpose**: Configure the parallelization strategy

**Dependencies**: `check-comment`

**Infrastructure**: Runs on `ubuntu-latest`

**Steps**:

1. **Set matrix containers**: Generate array of job numbers for parallel execution
   - Default: 4 parallel jobs (configurable via `PARALLEL_JOBS` variable)
   - Generates: `[1, 2, 3, 4]`
   - Each number represents one parallel AAP deployment + test run

**Outputs**:

- `matrix`: JSON array used by deploy-and-test job

**Tuning parallelization**: To adjust the number of parallel AAP deployments, modify the `PARALLEL_JOBS` variable in this job.

### Job 3: deploy-and-test (Matrix Strategy)

**Purpose**: Deploy a live AAP instance and run Cypress E2E tests against it

**Dependencies**: `check-comment`, `matrix-setup`

**Infrastructure**:

- Runs on custom `aap-dev` GitHub Actions runner
- Uses kind (Kubernetes in Docker) for AAP deployment
- Podman is upgraded to ensure compatibility
- **Matrix strategy**: Creates N parallel jobs, each with its own AAP instance
- **fail-fast: false**: All matrix jobs run to completion regardless of failures
- **Job-level concurrency**: Prevents duplicate test runs on the same PR while allowing different workflows to run simultaneously
- **IMPORTANT**: AAP deployment and testing must occur in the same job to ensure localhost connectivity

**Why combined job**: GitHub Actions jobs run in isolated environments. Even on the same runner, separate jobs don't share localhost network access. Combining deployment and testing ensures that the AAP instance deployed at `localhost:PORT` is accessible to the Cypress tests running in the same environment.

**Parallelization model**: Each matrix job:
1. Deploys its own independent AAP instance
2. Runs assigned subset of Cypress tests against that instance (determined by cypress-split)
3. Generates timing data for test distribution optimization
4. Cleans up its AAP deployment when complete

**Steps**:

1. **Checkout PR branch**: Uses the SHA from `check-comment` outputs

2. **Deploy AAP**: Uses the composite action from `ansible/aap-dev` repository

   - Action location: `ansible/aap-dev/.github/actions/aap_deploy@main`
   - Inputs:
     - Red Hat registry credentials (for pulling images)
     - AAP version (from check-comment job output, defaults to `2.6`)
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

3. **Setup test environment**:

   - Install Node.js 20
   - Cache and install npm dependencies (architecture-specific cache key)
   - Install Python 3.11
   - Install galaxykit (for Hub API testing)

4. **Build Platform UI**:

   ```bash
   cd platform
   npm run build
   ```

5. **Configure AAP connection**:

   - Takes `steps.deploy.outputs.aap_url` (AAP URL from deployment step)
   - Strips trailing slash using `sed 's:/*$::'`
   - Sets as `PLATFORM_SERVER` environment variable
   - This ensures Cypress tests connect to the deployed AAP instance

6. **Start Platform UI**:

   ```bash
   cd platform
   PLATFORM_SERVER=<aap_url> npm start &
   ```

   - Runs in background
   - Waits 15 seconds for startup
   - Verifies UI is accessible at `https://localhost:4100`

7. **Run Cypress tests**:

   - Direct `npx cypress run` execution (no Cypress Cloud)
   - Configuration:
     - `--config-file: cypress.platform.config.ts`
     - `--config video=true`: Enable video recording (overrides base config)
   - Environment variables:
     - **cypress-split configuration**:
       - `SPLIT`: Total number of parallel jobs (from `strategy.job-total`)
       - `SPLIT_INDEX`: Current job index, 0-based (from `strategy.job-index`)
       - `SPLIT_FILE`: `cypress-split-timings.json` (committed timings file)
     - **Test environment**:
       - `PLATFORM_SERVER`: AAP deployment URL (from deployment step)
       - `PLATFORM_USERNAME`: `admin`
       - `PLATFORM_PASSWORD`: From deployment step (`steps.deploy.outputs.admin_password`)
       - `CYPRESS_AWX_API_PREFIX`: `/api/controller/v2`
       - `CYPRESS_EDA_API_PREFIX`: `/api/eda/v1`
       - `NODE_TLS_REJECT_UNAUTHORIZED: 0`: Accept self-signed certs
       - `CYPRESS_LABELS: '!upstream'`: Skip upstream-only tests
   - **Test distribution**:
     - cypress-split plugin reads environment variables
     - If `cypress-split-timings.json` exists: duration-based balancing
     - If no timings file: alphabetical modulo distribution
     - Each job runs its assigned subset of tests independently

8. **Upload artifacts** (matrix-specific):
   - **Timings** (always): `cypress-split-timings.json` → `cypress-timings-{N}` artifact
     - Regular filename (no leading dot) for compatibility with upload-artifact@v4
     - Retention: 30 days
     - Used for maintaining optimized test distribution
   - **Screenshots** (on failure only): `cypress/screenshots` → `cypress-screenshots-{N}` artifact
     - Retention: 7 days
   - **Videos** (on failure only): `cypress/videos` → `cypress-videos-{N}` artifact
     - Retention: 7 days
     - Only recorded when tests fail (`videoUploadOnPasses=false`)
   - Each matrix job creates separate artifacts for easier troubleshooting

9. **Cleanup AAP deployment** (always runs):
   - Uses `ansible/aap-dev/.github/actions/aap_delete@main`
   - Ensures each matrix job cleans up its own AAP instance
   - Runs even if tests fail or job is cancelled

**Test Execution**:

- **Matrix parallelization**: 4 parallel jobs (configurable)
- **Each job**: Deploys its own independent AAP instance
- **cypress-split coordination**: Distributes tests across all parallel jobs using environment variables
- **Test distribution**: Duration-based balancing (with timings file) or alphabetical modulo (first run)
- **Faster feedback**: Total runtime reduced by ~30% with balanced distribution
- **Resource usage**: Higher resource usage during test execution, but cleanup ensures no waste
- **Tradeoff**: More AAP deployments vs faster test completion

**How cypress-split parallel mode works**:

1. Each matrix job reads `SPLIT`, `SPLIT_INDEX`, and `SPLIT_FILE` environment variables
2. cypress-split plugin determines which tests to run based on distribution algorithm
3. With timings file: Uses duration-based greedy algorithm for balanced load
4. Without timings file: Uses alphabetical modulo distribution (every Nth test)
5. Each job generates timing data and uploads as artifact for future optimization

### Job 4: report-results

**Purpose**: Aggregate matrix results and report to the pull request

**Infrastructure**: Runs on `ubuntu-latest` runner

**Dependencies**: `check-comment`, `matrix-setup`, `deploy-and-test`

**Condition**: `if: always()` (runs regardless of previous job status)

**Steps**:

1. **Check matrix results**: Analyzes the outcome of all matrix jobs
   - Checks if all jobs succeeded
   - Detects if any jobs failed
   - Detects if any jobs were cancelled

2. **Success comment** (all matrix jobs succeeded):

   ```
   ✅ AAP E2E tests completed successfully!

   **Parallelization**: Tests ran across 4 parallel AAP deployments

   Workflow run: <workflow_link>
   ```

3. **Failure comment** (any matrix jobs failed):

   ```
   ❌ AAP E2E tests failed.

   **Parallelization**: Tests ran across 4 parallel AAP deployments

   Please check the workflow run for details: <workflow_link>

   Test artifacts (screenshots, videos) are available in the workflow run.
   ```

4. **Cancelled comment** (any matrix jobs cancelled):

   ```
   ⚠️ AAP E2E tests were cancelled.

   Workflow run: <workflow_link>
   ```

## Data Flow: AAP URL to Cypress Tests

The `PLATFORM_SERVER` variable flows through the workflow as follows:

1. **aap-dev action output** → `steps.deploy.outputs.aap_url`
2. **Environment variable** → `PLATFORM_SERVER` (with trailing slash stripped)
3. **Platform UI startup** → Uses `$PLATFORM_SERVER` to proxy API requests
4. **Cypress environment** → `env.PLATFORM_SERVER` in test execution

This ensures that Cypress tests always connect to the freshly deployed AAP instance from the same job environment.

## Parallelization Strategy

### Overview

The workflow uses **cypress-split plugin with duration-based balancing** to achieve parallelization:

- **Matrix jobs**: 4 parallel jobs (default, configurable)
- **AAP instances**: 1 dedicated AAP instance per job
- **Test distribution**: cypress-split divides tests evenly using modulo or duration-based algorithm
- **No external service**: Self-contained, no Cypress Cloud required
- **Cleanup**: Each job cleans up its own AAP deployment

### How It Works

**Initial Run (No Timings File)**:
- cypress-split divides tests alphabetically using modulo distribution
- Each job gets every Nth test file based on its index
- Example with 80 tests across 4 jobs:
  - Job 0: tests 0, 4, 8, 12... (20 tests)
  - Job 1: tests 1, 5, 9, 13... (20 tests)
  - Job 2: tests 2, 6, 10, 14... (20 tests)
  - Job 3: tests 3, 7, 11, 15... (20 tests)
- Each job generates timing data for the tests it ran
- Timings are uploaded as artifacts for later merging

**With Timings File (Optimized Runs)**:
- cypress-split reads `cypress-split-timings.json` from the repository
- Uses duration-based greedy algorithm to balance total runtime
- Sorts tests by duration (longest first)
- Assigns each test to the job with smallest total duration
- All jobs finish at approximately the same time
- Typical improvement: 61min → 43min (30% faster)

### Test Distribution Algorithm

```
┌──────────────────────────────────────────────────────────┐
│  cypress-split Plugin (In Each Job)                      │
│                                                           │
│  1. Read cypress-split-timings.json (if exists)          │
│  2. Get SPLIT=4, SPLIT_INDEX from environment            │
│  3. Determine which tests this job should run:           │
│                                                           │
│     Without timings:                                     │
│     └─ Alphabetical + modulo distribution               │
│                                                           │
│     With timings:                                        │
│     └─ Duration-based greedy balancing                   │
│        ├─ Sort tests by duration (desc)                  │
│        ├─ Assign to job with smallest total              │
│        └─ Balance across all 4 jobs                      │
│                                                           │
│  4. Run assigned tests                                   │
│  5. Generate timings for this run                        │
│  6. Upload timings as artifact                           │
└──────────────────────────────────────────────────────────┘
```

### Benefits

1. **Duration-based balancing**: Optimizes test distribution by runtime, not just file count
2. **No external dependencies**: Works offline, no Cypress Cloud account needed
3. **Persistent optimization**: Timings committed to repo, optimization persists
4. **Cost effective**: Zero ongoing subscription costs
5. **Faster with optimization**: 30% improvement with balanced timings
6. **Isolated environments**: Each job has its own AAP instance
7. **Fault isolation**: Failures in one job don't affect others
8. **Scalable**: Easily adjust parallelization by changing `PARALLEL_JOBS`
9. **Better privacy**: No test data sent to external services

### Tradeoffs

**Pros**:
- Free (no Cypress Cloud subscription required)
- Faster execution with optimized timings (43min vs 61min)
- Self-contained solution
- Better data privacy
- Works in air-gapped environments

**Cons**:
- Requires manual timings updates (see Maintenance section below)
- First run without timings is slower and unbalanced (~61min)
- Need to merge timing artifacts after updates
- Higher resource usage during execution (4 AAP instances vs 1)

### Tuning Parallelization

To adjust the number of parallel jobs:

1. Edit `.github/workflows/ephemeral-aap-cypress.yml`
2. Find the `matrix-setup` job
3. Change the `PARALLEL_JOBS` variable:
   ```yaml
   run: |
     # Configure number of parallel AAP deployments/test runners
     PARALLEL_JOBS=8  # Change this value
   ```

**Recommended values**:
- **2-4 jobs**: Good balance for most cases
- **8+ jobs**: For very large test suites, ensure runner has capacity
- **1 job**: Disable parallelization (sequential execution)

## Maintenance

### Updating Test Timings

cypress-split uses `cypress-split-timings.json` for duration-based balancing. This file should be updated when:

- **Major test suite changes**: Tests are added, removed, or significantly modified
- **Observed imbalance**: Job completion times diverge (>15 min difference between fastest and slowest)
- **Routine maintenance**: Quarterly updates recommended
- **Performance changes**: After infrastructure or test optimization work

**Update Process**:

1. **Run workflow** to generate fresh timings
   - Post `/run-aap-ui-cypress` comment on any PR
   - Wait for all 4 matrix jobs to complete
   - Jobs will generate timing data for their assigned tests

2. **Download timing artifacts** from all 4 matrix jobs:
   - Navigate to workflow run → Summary → Artifacts section
   - Download: `cypress-timings-1`, `cypress-timings-2`, `cypress-timings-3`, `cypress-timings-4`
   - Extract all `.json` files to a working directory

3. **Merge timings** into single file:
   ```bash
   # Navigate to directory with extracted timing files
   jq -s '{ durations: [.[].durations[]] | sort_by(.spec) }' \
     cypress-split-timings*.json > cypress-split-timings.json
   ```

4. **Review merged timings**:
   ```bash
   # Check file has all ~80 test entries
   jq '.durations | length' cypress-split-timings.json

   # Sample some entries to verify format
   jq '.durations[0:3]' cypress-split-timings.json
   ```

5. **Commit and push** updated timings:
   ```bash
   git add cypress-split-timings.json
   git commit -m "Update cypress-split timings for balanced test distribution"
   git push
   ```

6. **Future runs automatically use updated timings**
   - Next workflow run will read committed timings
   - Tests will be distributed using duration-based balancing
   - All 4 jobs should finish within 5-10 minutes of each other

**Update Frequency Recommendations**:
- **After major changes**: Update immediately after significant test suite modifications
- **Routine maintenance**: Quarterly (every 3 months) to catch gradual drift
- **When imbalanced**: If you notice jobs finishing >15 min apart, update timings

**Monitoring Job Balance**:

Check workflow run times to identify when timings need updating:

```
Good balance (no update needed):
├─ Job 1: 41 min ✓
├─ Job 2: 43 min ✓
├─ Job 3: 44 min ✓
└─ Job 4: 45 min ✓
   Max difference: 4 minutes

Needs update (imbalanced):
├─ Job 1: 31 min
├─ Job 2: 33 min
├─ Job 3: 50 min ⚠
└─ Job 4: 61 min ❌
   Max difference: 30 minutes!
```

**Note**: The first run after committing new timings will still show the old distribution pattern. The optimization takes effect on the second and subsequent runs.

## Configuration

### Required GitHub Secrets

The following secrets must be configured in the repository settings:

| Secret Name                          | Description                                                                                     | Required |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | -------- |
| `RED_HAT_REGISTRY_USER`              | Red Hat registry username for pulling container images                                          | Yes      |
| `RED_HAT_REGISTRY_TOKEN`             | Red Hat registry token/password                                                                 | Yes      |
| `GH_TOKEN`                           | GitHub token with access to `ansible/aap-dev` repo (used for aap-dev checkout)                  | Yes      |
| `AAP_TEST_SECRETS_REPO_GITHUB_TOKEN` | GitHub token with access to `ansible/aap-test-secrets` repo (used for AAP license installation) | Yes      |

### Test Distribution

- **Timings file**: `cypress-split-timings.json` (committed to repository)
  - Contains duration data for all test files
  - Updated manually via maintenance process (see Maintenance section)
  - First run without timings uses alphabetical modulo distribution
  - Subsequent runs with timings use duration-based balancing
- **cypress-split plugin**: Automatically distributes tests across parallel jobs
  - Uses `SPLIT` and `SPLIT_INDEX` environment variables from GitHub Actions `strategy` context
  - No external service dependencies or API keys required

### Workflow Configuration

**File**: `.github/workflows/ephemeral-aap-cypress.yml`

**Configurable parameters**:

- **Parallelization**: `PARALLEL_JOBS=4` in matrix-setup job

  - Adjust number of parallel AAP deployments and test runners
  - Higher values = faster execution, more resources

- **Concurrency control**: Applied at deploy-and-test job level

  - Group: `ephemeral-aap-cypress-pr-${{ needs.check-comment.outputs.pr_number }}-${{ matrix.container }}`
  - Each matrix job has its own concurrency group
  - Prevents duplicate runs while allowing cross-workflow parallelization
  - Ensures all 4 matrix jobs run in parallel within the same workflow run

- **AAP deployment reference**: `uses: ansible/aap-dev/.github/actions/aap_deploy@main` in deploy-and-test job

  - Can pin to specific version: `@v1.2.3`
  - Can use specific commit: `@abc123def`

- **Cypress configuration**: `config-file: cypress.platform.config.ts` in Cypress test execution step

  - Can be changed to run different test suites
  - Video recording enabled via `--config video=true,videoUploadOnPasses=false` (only kept on failure)

- **Artifact retention**:
  - Timings: 30 days (used for test distribution optimization)
  - Screenshots and videos: 7 days (adjust based on storage requirements)

- **Artifact naming**: Artifacts include matrix number
  - `cypress-timings-1` through `cypress-timings-4`
  - `cypress-screenshots-1`, `cypress-screenshots-2`, etc. (on failure)
  - `cypress-videos-1` through `cypress-videos-4`
  - Helps identify which parallel job produced the artifacts

## Usage

### Triggering Tests

1. Navigate to a pull request in the aap-ui repository
2. Add a comment with the text: `/run-aap-ui-cypress`
   - **Default AAP version (2.6)**: `/run-aap-ui-cypress`
   - **Specific AAP version**: `/run-aap-ui-cypress 2.5-next` or `/run-aap-ui-cypress 2.6`
3. The workflow will start automatically
4. A 🚀 reaction will be added to your comment
5. A starting message will be posted to the PR thread (showing which AAP version will be deployed)

**Re-triggering Tests**:

If tests are currently running on a PR and you want to restart them (e.g., after pushing new commits):

1. Simply post `/run-aap-ui-cypress` again on the same PR (with or without a version)
2. The currently running workflow will be automatically cancelled
3. A new workflow run will start immediately with the specified (or default) AAP version
4. AAP deployments from the cancelled run will be cleaned up automatically

**Note**: Triggering with a different AAP version (e.g., `/run-aap-ui-cypress 2.5-next`) will cancel any in-progress run on that PR, regardless of which version was previously running.

This is useful when:
- You push new commits and want to test them immediately
- You want to restart flaky tests
- You want to test against a different AAP version
- You need to cancel a long-running test suite

### Monitoring Progress

1. Click the workflow run link in the starting message
2. View job progress in GitHub Actions UI
   - You'll see multiple `deploy-and-test` jobs running in parallel
   - Each job shows its matrix number (e.g., "Deploy AAP (1)")
3. Monitor test execution in GitHub Actions logs
   - Each job shows which tests it's running (based on cypress-split distribution)
   - Real-time console output visible in job logs
   - Job completion times indicate test distribution balance

### Viewing Results

**Success**:

- Green check mark on the PR
- Success comment posted to PR thread with parallelization info
- All tests passed across all parallel jobs

**Failure**:

- Red X on the PR
- Failure comment posted to PR thread with debugging resources
- Download artifacts from workflow run:
  - **Timings**: `cypress-timings-1`, `cypress-timings-2`, `cypress-timings-3`, `cypress-timings-4`
    - Contains test duration data for each job
    - Used for maintaining optimized test distribution
  - **Screenshots** (on failure): `cypress-screenshots-1`, `cypress-screenshots-2`, etc.
    - Visual evidence of test failures
    - Only uploaded when tests fail
  - **Videos** (on failure): `cypress-videos-1`, `cypress-videos-2`, etc.
    - Video recordings of failed test executions
    - Only recorded/uploaded when tests fail
    - Useful for debugging failures and flaky tests
  - Check the matrix job number to correlate with test failures
- View detailed logs in GitHub Actions:
  - Navigate to workflow run → Jobs → Select specific matrix job
  - View Cypress test output and error messages
  - Each job shows which tests it ran and their results
