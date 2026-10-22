# Playwright Tests with Currents.dev Integration

This document describes how to set up and use Playwright tests with Currents.dev dashboard reporting.

## Overview

When a workflow invokes `.github/workflows/playwright-currents.yml`, Currents.dev provides:

- ✅ **Parallel test execution** across multiple shards
- ✅ **Rich test reporting** with screenshots, videos, and logs
- ✅ **Test analytics** and flaky test detection
- ✅ **Test result history** and trends

**How runs are started in this repository** (nothing in Actions runs Currents on every `devel` push by default):

| Workflow                       | File                                                                             | Trigger                                      | Currents reporting                        |
| ------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| Reusable Playwright + Currents | `playwright-currents.yml`                                                        | `workflow_call` only                         | Yes, when a caller workflow invokes it    |
| Run Playwright with Currents   | `run-playwright-currents.yml`                                                    | `workflow_dispatch` (Actions → Run workflow) | Yes                                       |
| Pull request E2E               | External pipeline (comment `/run-playwright` on the PR; see `pr-e2e-status.yml`) | On demand per PR                             | Yes (bot posts a Currents dashboard link) |

GitHub PR comments and optional Slack notifications depend on which of the above paths ran and how your environment is configured—not on automatic pushes to `devel`.

## Setup

### 1. Currents.dev Account Setup

1. Sign up at [Currents.dev](https://currents.dev)
2. Create a new project for your repository
3. Copy the **Project ID** and **Record Key** from your project settings

### 2. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

| Secret Name           | Description                       | Required    |
| --------------------- | --------------------------------- | ----------- |
| `CURRENTS_PROJECT_ID` | Your Currents.dev project ID      | ✅ Yes      |
| `CURRENTS_RECORD_KEY` | Your Currents.dev record key      | ✅ Yes      |
| `PLATFORM_PASSWORD`   | Platform login password for tests | ✅ Yes      |
| `SLACK_WEBHOOK_URL`   | Slack webhook for notifications   | ❌ Optional |

**To add secrets:**

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

### 3. Workflow Configuration

The reusable workflow lives in `.github/workflows/playwright-currents.yml` (`workflow_call`). It is invoked by other workflows (for example ephemeral AAP Playwright on pull requests) with platform URL and credentials passed in as inputs.

The **Run Playwright with Currents** entry in the Actions tab (`.github/workflows/run-playwright-currents.yml`) is **`workflow_dispatch` only**—it does not run on every push or pull request to `devel`.

When invoked, a run will:

- **Execute tests in parallel** across multiple shards (configurable)
- **Upload artifacts** including test results and HTML reports
- **Report results** to Currents.dev (and optionally Slack, if configured)

## Usage

### Manual execution (Currents workflow)

To run the dispatch workflow against a specific environment:

1. Go to **Actions** in the GitHub repository
2. Select **Run Playwright with Currents**
3. Click **Run workflow**
4. Configure parameters:
   - **Platform URLs** - Test environment endpoints
   - **Test Tags** - Filter tests by tags
   - **Browser** - Choose browser for testing
   - **Project** - Select Playwright project

### Local Development

For local testing with Currents.dev integration:

```bash
# Set environment variables
export CURRENTS_PROJECT_ID="your-project-id"
export CURRENTS_RECORD_KEY="your-record-key"

# Run tests locally
cd playwright
npx currents playwright

# Run specific tests
npx currents playwright --grep="authentication"

# Run with specific browser
npx currents playwright --project="chromium"
```

## Test Results

### Currents.dev Dashboard

Access your test results at: `https://app.currents.dev`

**Features available:**

- 📊 **Test execution overview** with pass/fail metrics
- 🔍 **Detailed test results** with screenshots and videos
- 📈 **Historical trends** and performance analytics
- 🚨 **Flaky test detection** and failure analysis
- 🏷️ **Test tagging** and organization
- 💬 **Team collaboration** with comments and sharing

### GitHub Integration

**Pull request E2E (on-demand):**

- Comment `/run-playwright` on a pull request to request the external E2E pipeline.
- When that pipeline finishes, `aap-pde-ci-bot` may post a PR comment with a **Currents dashboard** link (see `.github/workflows/pr-e2e-status.yml`).

**Manual Currents workflow:**

- **Run Playwright with Currents** does not open automatically on every PR; use **Actions → Run Playwright with Currents** when you need a dispatch run against a specific environment.

**Commit status checks** apply only when your organization wires a workflow or external pipeline to required checks—they are not implied by every Currents run.

### Slack Notifications

`SLACK_WEBHOOK_URL` is listed as an optional repository secret for teams that connect Slack to their test pipeline. This repository’s GitHub Actions workflows do not send Slack messages on every `devel` push. Treat Slack as **optional** and configured outside these docs unless your deployment explicitly enables it for a given workflow.

## Troubleshooting

### Common Issues

**Tests not reporting to Currents.dev:**

- Verify `CURRENTS_PROJECT_ID` and `CURRENTS_RECORD_KEY` are set correctly
- Check workflow logs for authentication errors
- Ensure the Currents.dev project is active

**Slow test execution:**

- Adjust `PARALLEL_TESTS` / shard count in `playwright-currents.yml` inputs (default 4)
- Review test parallelization settings
- Check for resource constraints in GitHub Actions or the external E2E pipeline

**Missing artifacts:**

- Verify artifact upload step completed successfully
- Check artifact retention policy (currently 30 days)
- Ensure sufficient storage quota

### Advanced Configuration

**Custom test sharding:**

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4, 5, 6] # Increase for more parallelization
```

**Environment-specific configuration:**

```bash
# Different environments
PLATFORM_SERVER=https://staging.example.com
PLATFORM_SERVER=https://production.example.com
```

**Custom test filtering:**

```bash
# Run only smoke tests
TAGS=smoke

# Exclude flaky tests
NOT_TAGS=flaky

# Multiple tags
TAGS=smoke,critical
```

## Integration Benefits

### Development Workflow

- **Fast feedback** on PR test results
- **Historical context** for test failures
- **Flaky test identification** and remediation
- **Test coverage insights** and gaps

### Team Collaboration

- **Shared test results** and debugging
- **Centralized test analytics** and reporting
- **Automated notifications** and alerts
- **Test result sharing** and discussions

### Quality Assurance

- **Comprehensive test history** and trends
- **Performance regression detection**
- **Cross-browser compatibility testing**
- **Environment-specific test validation**

## Support

For issues related to:

- **Currents.dev integration**: [Currents.dev Documentation](https://currents.dev/readme)
- **Playwright configuration**: [Playwright Documentation](https://playwright.dev)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)

Need help? Contact the development team or create an issue in the repository.
