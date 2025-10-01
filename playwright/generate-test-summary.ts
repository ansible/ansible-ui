import type { JSONReport } from '@playwright/test/reporter';
import Anser from 'anser';
import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';

// GitHub Actions context information
const getGitHubContext = () => {
  return {
    runId: process.env.GITHUB_RUN_ID,
    runNumber: process.env.GITHUB_RUN_NUMBER,
    workflow: process.env.GITHUB_WORKFLOW,
    repository: process.env.GITHUB_REPOSITORY,
    ref: process.env.GITHUB_REF,
    sha: process.env.GITHUB_SHA,
    actor: process.env.GITHUB_ACTOR,
    eventName: process.env.GITHUB_EVENT_NAME,
    serverUrl: process.env.GITHUB_SERVER_URL,
    browser: process.env.BROWSER || 'chromium',
    platformUI: process.env.PLATFORM_UI,
    platformServer: process.env.PLATFORM_SERVER,
    project: process.env.PROJECT,
    tags: process.env.TAGS,
    notTags: process.env.NOT_TAGS,
    parallelTests: process.env.PARALLEL_TESTS,
  };
};

const file = readFileSync('results.json');
const jsonReport = JSON.parse(file.toString()) as JSONReport;

let passCount = 0;
let failureCount = 0;
let skippedCount = 0;
let flakyCount = 0;

// Check for discrepancies between reported stats and actual test data
const reportedStats = jsonReport.stats;

const failures: string[] = [];
const flaky: string[] = [];

// Helper to format duration
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

// Helper to get attachment info
interface Attachment {
  name: string;
  path?: string;
}

const getAttachmentInfo = (attachments: Attachment[]): string[] => {
  const info: string[] = [];
  for (const attachment of attachments) {
    if (attachment.name === 'screenshot' && attachment.path) {
      info.push(`📷 Screenshot`);
    } else if (attachment.name === 'trace' && attachment.path) {
      info.push(`🔍 Trace`);
    } else if (attachment.name === 'video' && attachment.path) {
      info.push(`🎥 Video`);
    }
  }
  return info;
};

// Helper function to add missing failure information to the report
const addMissingFailureInfo = (failures: string[]) => {
  failures.push('### ❌ **Test Failure Details Missing**');
  failures.push('');
  failures.push('**Issue:** Failed test details are missing from the merged report.');
  failures.push('');
  failures.push('**Possible Causes:**');
  failures.push('- Blob reports containing failures were not included in the merge process');
  failures.push('- Test shards failed to upload their results properly');
  failures.push('- Merge-reports command processed incomplete data');
  failures.push('');
  failures.push(
    '**Solution:** Check individual test shard reports for detailed error information.'
  );
  failures.push('');
};

// Process all test results
for (const suite of jsonReport.suites) {
  for (const spec of suite.specs) {
    for (const test of spec.tests) {
      const testTitle = spec.title;
      const projectName = test.projectName || 'unknown';

      // Determine the actual test outcome based on both status and results
      const hasFailedResults = test.results.some((result) => result.status === 'failed');
      const lastResultFailed = test.results[test.results.length - 1]?.status === 'failed';

      switch (test.status) {
        case 'expected':
          passCount++;
          break;

        case 'skipped':
          skippedCount++;
          break;

        case 'flaky': {
          flakyCount++;
          const lastResult = test.results[test.results.length - 1];
          const duration = lastResult?.duration || 0;
          const filePath = spec.file || suite.file || 'unknown';
          const fileName = filePath !== 'unknown' ? basename(filePath) : 'unknown';

          flaky.push(`### 🟡 **${testTitle}**`);
          flaky.push(
            `**File:** \`${fileName}\` | **Project:** \`${projectName}\` | **Duration:** ${formatDuration(duration)}`
          );
          flaky.push('');
          flaky.push('**Test was flaky but eventually passed after retries.**');

          // Show failed attempts
          const failedResults = test.results.filter((r) => r.status === 'failed');
          if (failedResults.length > 0) {
            flaky.push('');
            flaky.push('<details>');
            flaky.push('<summary>View failed attempts</summary>');
            flaky.push('');

            failedResults.forEach((result, index) => {
              flaky.push(`**Attempt ${index + 1}:**`);
              if (result.error?.message) {
                flaky.push('```');
                flaky.push(Anser.ansiToText(result.error.message));
                flaky.push('```');
              }
              flaky.push('');
            });

            flaky.push('</details>');
          }
          flaky.push('');
          break;
        }

        case 'unexpected': {
          failureCount++;
          const lastResult = test.results[test.results.length - 1];
          const duration = lastResult?.duration || 0;
          const filePath = spec.file || suite.file || 'unknown';
          const fileName = filePath !== 'unknown' ? basename(filePath) : 'unknown';

          failures.push(`### ❌ **${testTitle}**`);
          failures.push(
            `**File:** \`${fileName}\` | **Project:** \`${projectName}\` | **Duration:** ${formatDuration(duration)} | **Status:** \`${test.status}\``
          );
          failures.push('');

          // Show error details
          if (lastResult?.error?.message) {
            failures.push('<details>');
            failures.push('<summary>🔍 Error Details</summary>');
            failures.push('');
            failures.push('```');
            failures.push(Anser.ansiToText(lastResult.error.message));
            failures.push('```');
            failures.push('</details>');
            failures.push('');
          }

          // Show retry information if there were retries
          if (test.results.length > 1) {
            failures.push(`**Retries:** ${test.results.length - 1} attempt(s)`);
            failures.push('');
          }

          break;
        }

        default: {
          // Count as failed for unhandled statuses
          failureCount++;
          const lastResult = test.results[test.results.length - 1];
          const duration = lastResult?.duration || 0;
          const filePath = spec.file || suite.file || 'unknown';
          const fileName = filePath !== 'unknown' ? basename(filePath) : 'unknown';

          failures.push(`### ❌ **${testTitle}**`);
          failures.push(
            `**File:** \`${fileName}\` | **Project:** \`${projectName}\` | **Duration:** ${formatDuration(duration)} | **Status:** \`${String(test.status)}\``
          );
          failures.push('');

          // Show error details
          if (lastResult?.error?.message) {
            failures.push('<details>');
            failures.push('<summary>🔍 Error Details</summary>');
            failures.push('');
            failures.push('```');
            failures.push(Anser.ansiToText(lastResult.error.message));
            failures.push('```');
            failures.push('</details>');
            failures.push('');
          }
          break;
        }
      }

      // Additional check: if test has failed results but wasn't counted as failed above
      if (
        hasFailedResults &&
        test.status !== 'flaky' &&
        test.status !== 'unexpected' &&
        lastResultFailed
      ) {
        failureCount++;

        // Adjust counts to avoid double counting
        if (test.status === 'expected') {
          passCount--;
        }

        // Add to failures array
        const lastResult = test.results[test.results.length - 1];
        const duration = lastResult?.duration || 0;
        const filePath = spec.file || suite.file || 'unknown';
        const fileName = filePath !== 'unknown' ? basename(filePath) : 'unknown';

        failures.push(`### ❌ **${testTitle}** (Status Mismatch)`);
        failures.push(
          `**File:** \`${fileName}\` | **Project:** \`${projectName}\` | **Duration:** ${formatDuration(duration)} | **Reported Status:** \`${test.status}\` | **Actual Result:** \`failed\``
        );
        failures.push('');

        // Get attachments from the last result
        const attachments = lastResult?.attachments || [];
        const attachmentInfo = getAttachmentInfo(attachments);
        if (attachmentInfo.length > 0) {
          failures.push(`**Debug Info:** ${attachmentInfo.join(' | ')}`);
          failures.push('');
        }

        // Show error details
        if (lastResult?.error?.message) {
          failures.push('<details>');
          failures.push('<summary>🔍 Error Details</summary>');
          failures.push('');
          failures.push('```');
          failures.push(Anser.ansiToText(lastResult.error.message));
          failures.push('```');
          failures.push('</details>');
          failures.push('');
        }
      }

      // Final catch-all: ensure any test with failed results gets captured
      // But exclude flaky tests since they're already properly categorized
      if (hasFailedResults && test.status !== 'flaky') {
        // Check if this test was already added to failures by checking the current failures array length
        const currentFailuresForTest = failures.filter((f) => f.includes(`**${testTitle}**`));

        if (currentFailuresForTest.length === 0) {
          const lastResult = test.results[test.results.length - 1];
          const duration = lastResult?.duration || 0;
          const filePath = spec.file || suite.file || 'unknown';
          const fileName = filePath !== 'unknown' ? basename(filePath) : 'unknown';

          failures.push(`### ❌ **${testTitle}**`);
          failures.push(
            `**File:** \`${fileName}\` | **Project:** \`${projectName}\` | **Duration:** ${formatDuration(duration)} | **Status:** \`${test.status}\``
          );
          failures.push('');

          if (lastResult?.error?.message) {
            failures.push('<details>');
            failures.push('<summary>🔍 Error Details</summary>');
            failures.push('');
            failures.push('```');
            failures.push(Anser.ansiToText(lastResult.error.message));
            failures.push('```');
            failures.push('</details>');
            failures.push('');
          }
        }
      }
    }
  }
}

// Handle cases where test failures are missing from the merged report
const hasStatsDiscrepancy = reportedStats && reportedStats.unexpected > 0 && failureCount === 0;

if (hasStatsDiscrepancy) {
  // Adjust counts based on reported stats since detailed test data is missing
  failureCount = reportedStats.unexpected;
  passCount = reportedStats.expected;
  skippedCount = reportedStats.skipped || 0;
  flakyCount = reportedStats.flaky || 0;

  // Add failure information to the report
  addMissingFailureInfo(failures);
}

// Build the enhanced report
// Use Playwright's stats if available and different from our count
const statsTotal = reportedStats
  ? (reportedStats.expected || 0) +
    (reportedStats.skipped || 0) +
    (reportedStats.unexpected || 0) +
    (reportedStats.flaky || 0)
  : 0;
const calculatedTotal = passCount + failureCount + skippedCount + flakyCount;

// Prefer stats over calculated if they differ significantly
const totalTests =
  statsTotal > 0 && Math.abs(statsTotal - calculatedTotal) > 5 ? statsTotal : calculatedTotal;

// If using stats, update our counts to match
if (totalTests === statsTotal && reportedStats) {
  passCount = reportedStats.expected || 0;
  failureCount = reportedStats.unexpected || 0;
  skippedCount = reportedStats.skipped || 0;
  flakyCount = reportedStats.flaky || 0;
}

const successRate =
  totalTests > 0 ? (((passCount + flakyCount) / totalTests) * 100).toFixed(1) : '0';

const githubContext = getGitHubContext();

let report = `# 🎭 Playwright Test Results

## 📊 Executive Summary
| Metric | Value |
|--------|-------|
| 🎯 **Overall Success Rate** | **${successRate}%** |
| ✅ **Passed Tests** | ${passCount} |
| ❌ **Failed Tests** | ${failureCount} |
| 🟡 **Flaky Tests** | ${flakyCount} |
| ⏭️ **Skipped Tests** | ${skippedCount} |
| ⏱️ **Total Duration** | ${formatDuration(jsonReport.stats?.duration || 0)} |

## 🔧 Test Environment
| Setting | Value |
|---------|-------|
| **Browser** | ${githubContext.browser} |
| **Total Execution Time** | ${formatDuration(jsonReport.stats?.duration || 0)} |
| **Test Files** | ${jsonReport.suites.length} |
| **Total Tests** | ${totalTests} |

`;

// Add flaky tests section if any
if (flaky.length > 0) {
  report += `---

## 🟡 Flaky Tests (${flakyCount})
*Tests that failed initially but passed on retry*

${flaky.join('\n')}

`;
}

// Add failures section if any
if (failures.length > 0) {
  report += `---

## ❌ Failed Tests (${failureCount})
*Tests that failed all retry attempts*

${failures.join('\n')}

`;
}

// Add GitHub Actions context only if we have actual GitHub context
if (githubContext.runId) {
  report += `---

## 🔗 GitHub Actions Context
- **Run ID**: [${githubContext.runId}](${githubContext.serverUrl}/${githubContext.repository}/actions/runs/${githubContext.runId})
- **Workflow**: ${githubContext.workflow}
- **Repository**: ${githubContext.repository}
- **Branch/Ref**: ${githubContext.ref}
- **Commit**: [${githubContext.sha?.substring(0, 7)}](${githubContext.serverUrl}/${githubContext.repository}/commit/${githubContext.sha})
- **Triggered by**: ${githubContext.actor}
- **Event**: ${githubContext.eventName}

`;
}

writeFileSync('results.md', report);
