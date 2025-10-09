#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Migration Stats
 *
 * Analyzes git history to count Cypress tests deleted, Playwright tests added,
 * and Vitest tests added between a start date and an optional end date.
 *
 * This script helps track progress of migrating E2E tests from Cypress to Playwright
 * and component tests to Vitest by counting individual test blocks (not just test files).
 *
 * Usage:
 *   npm run migration-stats <start-date> [end-date]
 *   or
 *   npx tsx playwright/scripts/migration-stats.ts <start-date> [end-date]
 *
 * Examples:
 *   npm run migration-stats 2024-01-01
 *   npm run migration-stats 2024-01-01 2024-12-31
 *   npx tsx playwright/scripts/migration-stats.ts "2025-10-01"
 *   npx tsx playwright/scripts/migration-stats.ts "2025-10-01" "2025-10-09"
 *
 * Note: This script can be run from anywhere within the git repository.
 *       If no end date is provided, analysis runs to the current tip of origin/main.
 */

import { execSync } from 'child_process';

const startDate = process.argv[2];
const endDate = process.argv[3];

if (!startDate) {
  console.error('Usage: npm run migration-stats <start-date> [end-date]');
  console.error('       npx tsx playwright/scripts/migration-stats.ts <start-date> [end-date]');
  console.error('Example: npm run migration-stats 2024-01-01');
  console.error('         npm run migration-stats 2024-01-01 2024-12-31');
  console.error('         npx tsx playwright/scripts/migration-stats.ts "2024-12-01"');
  process.exit(1);
}

// Get the git repository root to ensure paths work regardless of where script is run from
const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();

function countTests(diff: string, pattern: RegExp, diffPrefix: string): number {
  const lines = diff.split('\n');
  let count = 0;

  for (const line of lines) {
    if (line.startsWith(diffPrefix)) {
      const content = line.substring(1).trim();

      // Skip comments
      if (content.startsWith('//') || content.startsWith('*') || content.startsWith('/*')) {
        continue;
      }

      if (pattern.test(content)) {
        count++;
      }
    }
  }

  return count;
}

function countRemainingCypressTests(gitRef: string): number {
  try {
    // Get the commit hash for the git reference
    const commitHash = execSync(`git rev-parse ${gitRef}`, {
      encoding: 'utf-8',
      cwd: gitRoot,
    })
      .toString()
      .trim();

    // List all .cy.ts and .cy.tsx files in cypress/e2e/ at this commit
    const fileList = execSync(
      `git ls-tree -r --name-only ${commitHash} cypress/e2e/ | grep -E '\\.cy\\.(ts|tsx)$' || true`,
      { encoding: 'utf-8', cwd: gitRoot }
    )
      .toString()
      .trim();

    if (!fileList) {
      return 0;
    }

    const files = fileList.split('\n').filter((f) => f.length > 0);
    let count = 0;

    for (const file of files) {
      // Get the content of the file at this commit
      const fileContent = execSync(`git show ${commitHash}:${file}`, {
        encoding: 'utf-8',
        cwd: gitRoot,
        maxBuffer: 10 * 1024 * 1024,
      }).toString();

      const lines = fileContent.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip comments
        if (
          trimmedLine.startsWith('//') ||
          trimmedLine.startsWith('*') ||
          trimmedLine.startsWith('/*')
        ) {
          continue;
        }

        // Match: it(, it.only(, it.skip(, it.todo(
        if (/^\s*it\s*(\(|\.only\(|\.skip\(|\.todo\()/.test(line)) {
          count++;
        }
      }
    }

    return count;
  } catch (error) {
    return 0;
  }
}

try {
  console.log('Fetching latest changes from origin...');
  execSync('git fetch origin', { stdio: 'pipe', cwd: gitRoot });

  // Build git log command based on whether end date is provided
  const gitLogRange = endDate
    ? `--since="${startDate}" --until="${endDate}" origin/main`
    : `--since="${startDate}" origin/main`;

  const periodDescription = endDate
    ? `${startDate} to ${endDate}`
    : `${startDate} to origin/main (current tip)`;

  console.log('\nAnalyzing Cypress E2E test deletions...');
  const cypressDiff = execSync(`git log ${gitLogRange} -p -- cypress/e2e/`, {
    encoding: 'utf-8',
    maxBuffer: 100 * 1024 * 1024,
    cwd: gitRoot,
  }).toString();

  // Match Cypress test declarations: it(, it.only(, it.skip(, etc.
  // Exclude hooks: it.beforeEach, it.afterEach, etc.
  // Only counts E2E tests in cypress/e2e/, excludes component tests
  const cypressPattern = /^\s*it\s*(\(|\.only\(|\.skip\(|\.todo\()/;
  const cypressDeleted = countTests(cypressDiff, cypressPattern, '-');

  console.log('Analyzing Playwright test additions...');
  const playwrightDiff = execSync(`git log ${gitLogRange} -p -- playwright/`, {
    encoding: 'utf-8',
    maxBuffer: 100 * 1024 * 1024,
    cwd: gitRoot,
  }).toString();

  // Match Playwright test declarations: test(, test.only(, test.skip(, test.fail(, etc.
  // Exclude hooks: test.beforeEach, test.afterEach, test.beforeAll, test.afterAll, test.describe
  const playwrightPattern = /^\s*test\s*(\(|\.only\(|\.skip\(|\.fail\(|\.fixme\()/;
  const playwrightAdded = countTests(playwrightDiff, playwrightPattern, '+');

  console.log('Analyzing Vitest test additions...');
  const vitestDiff = execSync(
    `git log ${gitLogRange} -p -- frontend/ framework/ -- '*.test.ts' '*.test.tsx'`,
    {
      encoding: 'utf-8',
      maxBuffer: 100 * 1024 * 1024,
      cwd: gitRoot,
    }
  ).toString();

  // Match Vitest test declarations: it( or test(, with .only, .skip, etc.
  // Vitest supports both 'it' and 'test' syntax
  const vitestPattern = /^\s*(it|test)\s*(\(|\.only\(|\.skip\(|\.todo\(|\.concurrent\(|\.fails\()/;
  const vitestAdded = countTests(vitestDiff, vitestPattern, '+');

  console.log('Counting remaining Cypress tests...');
  // Determine the git reference to use for counting remaining tests
  // If endDate is provided, find the commit at that date; otherwise use origin/main
  const gitRefForRemaining = endDate
    ? execSync(`git log origin/main --until="${endDate}" --format="%H" -n 1`, {
        encoding: 'utf-8',
        cwd: gitRoot,
      })
        .toString()
        .trim()
    : 'origin/main';

  const cypressRemaining = countRemainingCypressTests(gitRefForRemaining);

  console.log('\n' + '='.repeat(70));
  console.log('Test Migration Analysis Report');
  console.log('='.repeat(70));
  console.log(`Analysis Period: ${periodDescription}`);
  console.log('='.repeat(70));
  console.log(`Cypress tests deleted:    ${cypressDeleted}`);
  console.log(`Playwright tests added:   ${playwrightAdded}`);
  console.log(`Vitest tests added:       ${vitestAdded}`);
  console.log(`Cypress tests remaining:  ${cypressRemaining}`);
  console.log('='.repeat(70));
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('\nError:', errorMessage);
  process.exit(1);
}
