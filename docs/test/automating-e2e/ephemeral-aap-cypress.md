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

**Concurrency Control**:

- **Group**: `ephemeral-aap-cypress-{PR_NUMBER}`
- **Cancel in progress**: `true`
- If a new test run is triggered while one is already running for the same PR, the old run is automatically cancelled
- This prevents wasting resources on outdated test runs
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
4. Add rocket emoji reaction to the trigger comment
5. Post a starting message to the PR thread

**Outputs**:

- `triggered`: Boolean flag (always `true` when job runs)
- `pr_number`: Pull request number
- `pr_sha`: Commit SHA of PR head
- `pr_ref`: Branch name of PR head

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

**Tuning parallelization**: To adjust the number of parallel AAP deployments, modify the `PARALLEL_JOBS` variable in this job (line 109 in workflow file).

### Job 3: deploy-and-test (Matrix Strategy)

**Purpose**: Deploy a live AAP instance and run Cypress E2E tests against it

**Dependencies**: `check-comment`, `matrix-setup`

**Infrastructure**:

- Runs on custom `aap-dev` GitHub Actions runner
- Uses kind (Kubernetes in Docker) for AAP deployment
- Podman is upgraded to ensure compatibility
- **Matrix strategy**: Creates N parallel jobs, each with its own AAP instance
- **fail-fast: false**: All matrix jobs run to completion regardless of failures
- **IMPORTANT**: AAP deployment and testing must occur in the same job to ensure localhost connectivity

**Why combined job**: GitHub Actions jobs run in isolated environments. Even on the same runner, separate jobs don't share localhost network access. Combining deployment and testing ensures that the AAP instance deployed at `localhost:PORT` is accessible to the Cypress tests running in the same environment.

**Parallelization model**: Each matrix job:
1. Deploys its own independent AAP instance
2. Runs Cypress tests in parallel mode against that instance
3. Cypress Cloud coordinates test distribution across all matrix jobs
4. Cleans up its AAP deployment when complete

**Steps**:

1. **Checkout PR branch**: Uses the SHA from `check-comment` outputs

2. **Deploy AAP**: Uses the composite action from `ansible/aap-dev` repository

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

   - Uses `cypress-io/github-action@v6`
   - Configuration:
     - `install: false` (already installed)
     - `wait-on: 'https://localhost:4100'`
     - `record: true` (sends results to Cypress Cloud)
     - `parallel: true` (enables parallel test execution)
     - `config-file: cypress.platform.config.ts`
     - `tag: ephemeral-aap-cypress` (tags in Cypress Cloud)
   - Environment variables:
     - `PLATFORM_SERVER`: AAP deployment URL (from deployment step)
     - `PLATFORM_USERNAME`: `admin`
     - `PLATFORM_PASSWORD`: From deployment step (`steps.deploy.outputs.admin_password`)
     - `CYPRESS_PROJECT_ID`: Cypress Cloud project ID
     - `CYPRESS_RECORD_KEY`: Cypress Cloud API key
     - `CYPRESS_AWX_API_PREFIX`: `/api/controller/v2`
     - `CYPRESS_EDA_API_PREFIX`: `/api/eda/v1`
     - `NODE_TLS_REJECT_UNAUTHORIZED: 0`: Accept self-signed certs
     - `CYPRESS_LABELS: '!upstream'`: Skip upstream-only tests

8. **Upload artifacts** (matrix-specific):
   - Screenshots (on failure only): `cypress/screenshots` → artifact name includes matrix number
   - Videos (always): `cypress/videos` → artifact name includes matrix number
   - Retention: 7 days
   - Each matrix job creates separate artifacts for easier troubleshooting

9. **Cleanup AAP deployment** (always runs):
   - Uses `ansible/aap-dev/.github/actions/aap_delete@main`
   - Ensures each matrix job cleans up its own AAP instance
   - Runs even if tests fail or job is cancelled

**Test Execution**:

- **Matrix parallelization**: 4 parallel jobs (configurable)
- **Each job**: Deploys its own AAP instance
- **Cypress Cloud coordination**: Distributes tests across all parallel runners
- **Test distribution**: Cypress Cloud intelligently assigns tests to available runners
- **Faster feedback**: Total runtime reduced by ~4x (with 4 parallel jobs)
- **Resource usage**: Higher resource usage during test execution, but cleanup ensures no waste
- **Tradeoff**: More AAP deployments vs faster test completion

**How Cypress parallel mode works**:

1. Each matrix job connects to Cypress Cloud with `parallel: true`
2. Cypress Cloud maintains a queue of all test files
3. Each runner requests tests from the queue as it becomes available
4. Tests are dynamically distributed for optimal load balancing
5. All results are aggregated in Cypress Cloud dashboard

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

The workflow uses a **matrix strategy with multiple AAP deployments** to achieve parallelization:

- **Matrix jobs**: 4 parallel jobs (default, configurable)
- **AAP instances**: 1 dedicated AAP instance per job
- **Test distribution**: Cypress Cloud distributes tests across all runners
- **Cleanup**: Each job cleans up its own AAP deployment

### How It Works

```
┌──────────────────────────────────────────────────────────────┐
│  Matrix Job 1          Matrix Job 2          Matrix Job N    │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────┐    │
│  │ AAP Deploy  │       │ AAP Deploy  │       │  AAP    │    │
│  │  Instance 1 │       │  Instance 2 │  ...  │Instance │    │
│  └──────┬──────┘       └──────┬──────┘       └────┬────┘    │
│         │                     │                    │         │
│         │ Cypress connects with parallel: true    │         │
│         └──────────────┬──────────────────────────┘         │
│                        │                                     │
│                        ▼                                     │
│              ┌──────────────────┐                            │
│              │  Cypress Cloud   │                            │
│              │                  │                            │
│              │ Test Queue:      │                            │
│              │ ├─ test1.spec.ts │                            │
│              │ ├─ test2.spec.ts │                            │
│              │ ├─ test3.spec.ts │                            │
│              │ └─ ...           │                            │
│              └──────────────────┘                            │
│                        │                                     │
│         Dynamic test assignment to available runners         │
└──────────────────────────────────────────────────────────────┘
```

### Benefits

1. **Faster feedback**: ~4x speedup with 4 parallel jobs
2. **Isolated environments**: Each job has its own AAP instance
3. **Dynamic load balancing**: Cypress Cloud optimally distributes tests
4. **Fault isolation**: Failures in one job don't affect others
5. **Scalable**: Easily adjust parallelization by changing `PARALLEL_JOBS`

### Tradeoffs

**Pros**:
- Significantly faster test execution
- Better resource utilization across the self-hosted runner
- Reduced time-to-feedback for PR authors

**Cons**:
- Higher resource usage during execution (4 AAP instances vs 1)
- More complex workflow structure
- Requires Cypress Cloud for test coordination

### Tuning Parallelization

To adjust the number of parallel jobs:

1. Edit `.github/workflows/ephemeral-aap-cypress.yml`
2. Find the `matrix-setup` job (around line 107)
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

## Configuration

### Required GitHub Secrets

The following secrets must be configured in the repository settings:

| Secret Name                          | Description                                                                                     | Required |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | -------- |
| `RED_HAT_REGISTRY_USER`              | Red Hat registry username for pulling container images                                          | Yes      |
| `RED_HAT_REGISTRY_TOKEN`             | Red Hat registry token/password                                                                 | Yes      |
| `GH_TOKEN`                           | GitHub token with access to `ansible/aap-dev` repo (used for aap-dev checkout)                  | Yes      |
| `AAP_TEST_SECRETS_REPO_GITHUB_TOKEN` | GitHub token with access to `ansible/aap-test-secrets` repo (used for AAP license installation) | Yes      |
| `PLATFORM_PROJECT_ID`                | Cypress Dashboard project ID for recording test results                                         | Yes      |
| `PLATFORM_RECORD_KEY`                | Cypress Dashboard record key for authentication                                                 | Yes      |

### Workflow Configuration

**File**: `.github/workflows/ephemeral-aap-cypress.yml`

**Configurable parameters**:

- **Parallelization**: Line 109 - `PARALLEL_JOBS=4`

  - Adjust number of parallel AAP deployments and test runners
  - Higher values = faster execution, more resources

- **AAP deployment reference**: Line 134 - `uses: ansible/aap-dev/.github/actions/aap_deploy@main`

  - Can pin to specific version: `@v1.2.3`
  - Can use specific commit: `@abc123def`

- **Cypress configuration**: Line 203 - `config-file: cypress.platform.config.ts`

  - Can be changed to run different test suites

- **Test tags**: Line 204 - `tag: ephemeral-aap-cypress`

  - Used to filter tests in Cypress Cloud

- **Artifact retention**: Lines 224, 230 - `retention-days: 7`

  - Adjust based on storage requirements

- **Artifact naming**: Lines 222, 229
  - Artifacts include matrix number: `cypress-screenshots-1`, `cypress-videos-1`
  - Helps identify which parallel job produced the artifacts

## Usage

### Triggering Tests

1. Navigate to a pull request in the aap-ui repository
2. Add a comment with the text: `/run-aap-ui-cypress`
3. The workflow will start automatically
4. A 🚀 reaction will be added to your comment
5. A starting message will be posted to the PR thread

### Monitoring Progress

1. Click the workflow run link in the starting message
2. View job progress in GitHub Actions UI
   - You'll see multiple `deploy-and-test` jobs running in parallel
   - Each job shows its matrix number (e.g., "Deploy AAP (1)")
3. Check Cypress Cloud for real-time test execution
   - All parallel runners report to the same test run
   - Test distribution is visible in the dashboard

### Viewing Results

**Success**:

- Green check mark on the PR
- Success comment posted to PR thread with parallelization info
- All tests passed across all parallel jobs in Cypress Cloud

**Failure**:

- Red X on the PR
- Failure comment posted to PR thread with parallelization info
- Download artifacts from workflow run:
  - Multiple artifact sets (one per matrix job)
  - `cypress-screenshots-1`, `cypress-screenshots-2`, etc.
  - `cypress-videos-1`, `cypress-videos-2`, etc.
  - Check the matrix job number to correlate with test failures
- View detailed failure information in Cypress Cloud
  - All results are aggregated in a single test run
  - Can see which parallel runner executed each test
