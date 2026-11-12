# AAP-95513 Filtered Controller Job Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Automation Dashboard successful/failed job links preserve the active Dashboard filters when opening the Controller Jobs page.

**Architecture:** Add a small pure URL-builder utility beside the Automation Dashboard query-string utilities. It maps Dashboard filter IDs to Controller Jobs API parameters and resolves the Dashboard period into UTC finished bounds using the same preset/custom semantics as the metrics service. `AutomationDashboard` uses the helper for both value-card links.

**Tech Stack:** React, TypeScript, React Router URL links, Luxon 3.7, Vitest.

**Spec:** AAP-95513 pasted ticket text: preserve label, organization, template, project, status, and date context; use label IDs; do not change metrics counting without job-ID evidence.

## Global Constraints

- Do not modify metrics-service counting or label synchronization in this PR.
- Controller filters must use IDs: `labels__id`, `organization`, `job_template`, and `project`.
- Date bounds must be emitted as UTC ISO timestamps under `finished__gte` and `finished__lte`.
- Preserve the existing default link behavior when no optional filters are active.
- Keep the existing dashboard route and status values unchanged.

## Review Focus

- Relative periods: resolve `last_7_days`, `last_14_days`, `last_30_days`, `last_60_days`, and `last_90_days` from the current instant.
- Custom periods: convert local start/end dates in the dashboard timezone to UTC day boundaries.
- Multiple selections: append repeated Controller parameters instead of comma-joining IDs.
- Duplicate label names: preserve the selected label ID and never reconstruct the URL from a label name.
- Missing/invalid period state: avoid emitting malformed date parameters and retain the status-only link.

### Task 1: Add and test the Controller Jobs URL builder

**Files:**

- Create: `frontend/awx/analytics/automation-dashboard/utils/controllerJobsUrl.ts`
- Test: `frontend/awx/analytics/automation-dashboard/utils/controllerJobsUrl.test.ts`

- [x] Write failing tests for status-only links, all ID filters, repeated values, relative periods, custom periods, and invalid/missing periods.
- [x] Run the focused Vitest file and confirm it fails because the helper does not exist.
- [x] Implement `getControllerJobsUrl(status, filterState, timeZone, now)` using Luxon and `URLSearchParams`.
- [x] Run the focused Vitest file and confirm it passes.

### Task 2: Wire both Dashboard cards to the helper

**Files:**

- Modify: `frontend/awx/analytics/automation-dashboard/AutomationDashboard.tsx`
- Modify: `frontend/awx/analytics/automation-dashboard/AutomationDashboard.test.tsx`

- [x] Add focused component assertions that successful and failed links include the active filters and date bounds.
- [x] Run the focused component test and confirm the existing hard-coded links fail the new assertions.
- [x] Pass the view’s `filterState` and Dashboard timezone into the helper and use the returned URL for both cards.
- [x] Run the focused component test and confirm it passes.

### Task 3: Verify and prepare the pull request

**Files:**

- Modify: `docs/superpowers/plans/2026-11-12-aap-95513-filtered-job-links.md`

- [x] Run formatting, focused Vitest, targeted ESLint, and guardrails. The AWX TypeScript target is blocked by pre-existing cross-worktree errors in unrelated files; the full repository test command was not run after that prerequisite failure.
- [x] Review the diff for unrelated changes and confirm metrics-service files are untouched.
- [x] Commit the plan, implementation, and tests on the feature branch.
- [x] Push the branch and create pull request [ansible-ui#3898](https://github.com/ansible/ansible-ui/pull/3898) against `devel` with the AAP-95513 root cause, scope, tests, and explicit note that count reconciliation remains separate.
