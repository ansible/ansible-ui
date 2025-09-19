# Playwright Tests with Currents.dev Integration

This document describes how to set up and use Playwright tests with Currents.dev dashboard reporting.

## Overview

The integration provides:

- ✅ **Parallel test execution** across multiple shards
- ✅ **Rich test reporting** with screenshots, videos, and logs
- ✅ **Test analytics** and flaky test detection
- ✅ **GitHub integration** with PR comments and commit status
- ✅ **Slack notifications** for test failures
- ✅ **Test result history** and trends

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

The workflow is automatically configured in `.github/workflows/playwright-currents.yml` and will:

- **Trigger on:**

  - Pull requests to `main` or `develop` branches
  - Pushes to `main` or `develop` branches
  - Manual workflow dispatch with custom parameters

- **Run tests in parallel** across 4 shards for faster execution
- **Upload artifacts** including test results and HTML reports
- **Send notifications** to Slack (if configured)

## Usage

### Automatic Execution

Tests run automatically on:

- **Pull Requests** - Full test suite validation
- **Main/Develop pushes** - Regression testing
- **Scheduled runs** - Nightly test execution

### Manual Execution

You can manually trigger tests with custom parameters:

1. Go to **Actions** tab in your GitHub repository
2. Select **Playwright Tests with Currents.dev** workflow
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

**Pull Request Comments:**

- Automatic test result summary
- Links to detailed reports
- Failure screenshots and logs

**Commit Status Checks:**

- Pass/fail status on commits
- Required checks for branch protection
- Integration with merge requirements

### Slack Notifications

**Automatic notifications for:**

- ❌ **Test failures** on main branch
- ✅ **Successful runs** after previous failures
- 📊 **Weekly test summaries** (if configured)

## Troubleshooting

### Common Issues

**Tests not reporting to Currents.dev:**

- Verify `CURRENTS_PROJECT_ID` and `CURRENTS_RECORD_KEY` are set correctly
- Check workflow logs for authentication errors
- Ensure the Currents.dev project is active

**Slow test execution:**

- Adjust shard count in the workflow (currently 4 shards)
- Review test parallelization settings
- Check for resource constraints in GitHub Actions

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
