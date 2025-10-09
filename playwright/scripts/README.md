# Migration Stats

## Overview

The Migration Stats script analyzes git history to track the progress of migrating tests from Cypress to Playwright and from Cypress component tests to Vitest.

This script counts individual test blocks (not just test files) to provide accurate metrics on test migration progress.

## What It Counts

### Cypress E2E Tests Deleted

- Counts `it()` test declarations removed from `cypress/e2e/` directory
- Excludes component tests in `frontend/` and `framework/` directories
- Only counts actual test blocks, not hooks like `beforeEach` or `afterEach`
- Tracks: `it(`, `it.only(`, `it.skip(`, `it.todo(`

### Playwright Tests Added

- Counts `test()` declarations added to `playwright/` directory
- Excludes hooks and describe blocks
- Tracks: `test(`, `test.only(`, `test.skip(`, `test.fail(`, `test.fixme(`

### Vitest Tests Added

- Counts `it()` and `test()` declarations added to `frontend/` and `framework/` directories
- Only counts `.test.ts` and `.test.tsx` files
- Tracks both `it()` and `test()` syntax variants
- Tracks: `it(`, `test(`, `.only(`, `.skip(`, `.todo(`, `.concurrent(`, `.fails(`

### Cypress Tests Remaining

- Counts total `it()` test blocks still present in `cypress/e2e/` at the analysis end point
- Uses git history to count tests at the specified commit (end date or `origin/main`)
- Provides a snapshot of migration progress

## Usage

### Basic Syntax

```bash
npx tsx playwright/scripts/migration-stats.ts <start-date> [end-date]
```

Or using the npm script from the playwright directory:

```bash
npm run migration-stats <start-date> [end-date]
```

**Required:**

- `start-date`: The starting date for analysis (format: YYYY-MM-DD)

**Optional:**

- `end-date`: The ending date for analysis (format: YYYY-MM-DD)
  - If omitted, analyzes up to the current tip of `origin/main`

### Examples

#### Analyze from a start date to present

```bash
npm run migration-stats "2025-10-01"
```

Output:

```
======================================================================
Test Migration Analysis Report
======================================================================
Analysis Period: 2025-10-01 to origin/main (current tip)
======================================================================
Cypress tests deleted:    22
Playwright tests added:   37
Vitest tests added:       30
Cypress tests remaining:  542
======================================================================
```

#### Analyze a specific date range

```bash
npm run migration-stats "2025-10-01" "2025-10-08"
```

Output:

```
======================================================================
Test Migration Analysis Report
======================================================================
Analysis Period: 2025-10-01 to 2025-10-08
======================================================================
Cypress tests deleted:    16
Playwright tests added:   32
Vitest tests added:       20
Cypress tests remaining:  548
======================================================================
```

#### From project root using workspace

```bash
# From the project root
npm --workspace=@ansible/playwright run migration-stats 2025-10-01

# With end date
npm --workspace=@ansible/playwright run migration-stats 2025-10-01 2025-10-09
```

## How It Works

1. **Fetches latest changes** from `origin` to ensure analysis is up-to-date
2. **Analyzes git log** for the specified date range on `origin/main` branch
3. **Parses diffs** to count added (+) and deleted (-) test declarations
4. **Filters out comments** to avoid false positives
5. **Counts remaining tests** from git history at the end date or `origin/main` HEAD

## Notes

- The script can be run from anywhere within the git repository
- All counts are based on git history, not local filesystem changes
- The "remaining" count reflects the state at the analysis end point (end date or `origin/main`)
- Comment lines are excluded from all counts
- Only counts test declarations, not test file additions/deletions
- **Future end dates**: If the end date is in the future, the script effectively analyzes up to the current tip of `origin/main` (git's natural behavior with `--until`)

## Use Cases

### Track Weekly Migration Progress

```bash
npm run migration-stats "2025-10-01" "2025-10-07"
npm run migration-stats "2025-10-08" "2025-10-14"
```

### Generate Sprint Report

```bash
npm run migration-stats "2025-09-15" "2025-09-30"
```

### Monitor Overall Progress Since Migration Start

```bash
npm run migration-stats "2024-01-01"
```

## Interpreting Results

### Migration Velocity

Compare "Cypress tests deleted" with "Playwright tests added" to understand the migration pace:

- **More Playwright added than Cypress deleted**: Tests are being expanded or improved during migration
- **Equal numbers**: 1:1 migration
- **More Cypress deleted**: Tests may be consolidated or deemed unnecessary

### Remaining Work

The "Cypress tests remaining" provides a clear target for ongoing migration efforts.

### Test Coverage Trends

"Vitest tests added" shows component test migration progress, separate from E2E migration.
