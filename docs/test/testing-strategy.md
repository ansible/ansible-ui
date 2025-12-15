# Testing Strategy

## Document Overview

This document defines the comprehensive testing strategy for the Ansible Automation Platform (AAP) UI monorepo. It outlines our testing objectives, test types, execution phases, quality gates, and ongoing migration efforts.

**Last Updated:** December 2025
**Status:** Living document - updated as testing practices evolve

---

## Table of Contents

1. [Objectives](#objectives)
2. [Contributing Tests](#contributing-tests)
3. [Test Types & Pyramid](#test-types--pyramid)
4. [Getting Started with Playwright](#getting-started-with-playwright)
5. [Testing Phases](#testing-phases)
6. [Migration Status](#migration-status)
7. [Coverage & Quality Gates](#coverage--quality-gates)
8. [Infrastructure & Tools](#infrastructure--tools)
9. [Future Initiatives](#future-initiatives)
10. [Troubleshooting & Resources](#troubleshooting--resources)
11. [Appendix: Best Practices](#appendix-best-practices)

---

## Objectives

### Primary Goals

- **Prevent Regressions**: Validate pull requests to prevent breakages before merge
- **Validate Platform Functionality**: Ensure the Platform UI works correctly against all supported AAP configurations
- **Maintain Quality**: Enforce code quality standards and coverage thresholds
- **Enable Confidence**: Provide fast, reliable feedback to developers throughout the development lifecycle

### Success Metrics

- 80%+ code coverage across all test types
- Zero test failures on main branch
- All quality gates pass before merge
- Fast feedback on PRs (< 1 hour for test completion)

---

## Contributing Tests

When working on a ticket (feature or bug), follow these guidelines for writing tests:

### For Feature Development

Begin with a comprehensive Test Plan covering:

**Test Flows:**

- **Positive flows**: All happy paths and expected use cases
- **Negative flows**: Error handling, validation, edge cases
- **End-to-end flows**: Complete user journeys

**Automation Decision Process:**

Once the Test Plan is ready, categorize test cases:

1. **Must automate as part of the ticket**

   - Add to acceptance criteria
   - Ticket cannot be closed without automation
   - Critical for regression prevention

2. **Can automate later**

   - Verify manually for current ticket
   - Create follow-up tickets for automation

3. **Cannot automate**
   - Verify manually
   - Document in test plan why automation isn't feasible

### For Bug Fixes

Automating bug fix tests ensures the issue doesn't resurface:

**Process:**

1. Write the test case (usually 1-2 tests)
2. Include tests in the bug fix PR (required)

---

## Test Types & Pyramid

We follow the test pyramid approach with four distinct test types, each serving a specific purpose.

### Testing Principles

**Test as far left as possible:** When testing functionality, write the test at the lowest level that makes sense. Unit tests fail fast and pinpoint exact failures. Integration and UAT tests require deeper investigation but catch systemic issues.

**The lines between categories are sometimes fuzzy**, and that's okay. Having agreed-upon terminology is important for clear communication and planning.

**Most tests should be component tests**, with unit tests for complex logic and integration/UAT tests for critical workflows.

> "People love debating what percentage of which type of tests to write, but it's a distraction. Nearly zero teams write expressive tests that establish clear boundaries, run quickly & reliably, and only fail for useful reasons. Focus on that instead." — Justin Searls

---

### 1. Unit Tests

**Purpose:** Test pure logic and functions in isolation

**Tool:** Vitest
**Speed:** Extremely fast (milliseconds)
**Location:** Colocated with source code (`*.test.ts` or `*.spec.ts`)

**Characteristics:**

- No DOM rendering
- Mock all dependencies (APIs, browser APIs, external modules)
- Focus on business logic, utilities, helpers
- Best for testing multiple input permutations

**When to Write:**

- Testing pure functions
- Complex calculations or transformations
- Utility modules
- Custom hooks in isolation

---

### 2. Component Tests

**Purpose:** Test React components and their interactions with minimal mocking

**Tool:** Vitest with React Testing Library
**Speed:** Fast
**Location:** Colocated with component code (`*.test.tsx` or `*.spec.tsx`)

Component tests assert that several units within the codebase work together correctly. They should not rely on code outside the aap-ui repository.

**Characteristics:**

- Renders components in test environment
- Tests UI interactions, form behaviors, state management
- Mock **only external APIs** (not internal utilities or components)
- Allows testing multiple scenarios (empty state, limited permissions, missing data)

**When to Write:**

- Component rendering logic
- User interactions (clicks, form fills)
- Component state changes
- Form validation logic

**Critical Rule:** Avoid unnecessary mocks! Only mock external APIs, browser APIs, or genuinely difficult dependencies. Test real behavior whenever possible.

---

### 3. Integration Tests

**Purpose:** Test API interactions and workflows against a live AAP instance

**Tool:** Playwright
**Speed:** Slow
**Location:** `/playwright/tests/` organized by service (AWX, EDA, Hub, Platform)

Integration tests validate proper system integration without mocking the API. They may mock external systems (e.g., OAuth endpoints) if necessary.

**Characteristics:**

- Full browser automation (Playwright)
- Live API interactions (no mocking)
- Tests RBAC, permissions, job execution, database operations
- Focus on API interaction correctness
- Minimize API request redundancy across tests

**When to Write:**

- User workflows requiring complex API interaction
- API interactions and data persistence
- RBAC and permissions
- Cross-service integrations (Controller + EDA + Hub)

---

### 4. User Acceptance Tests (UAT)

**Purpose:** Test complete user journeys based on real-world user stories

**Tool:** Playwright
**Speed:** Slowest
**Location:** `/playwright/tests/` organized by service, typically in UAT-specific subdirectories

UAT tests validate entire user flows from start to finish, spanning multiple resources. They provide the highest level of assurance but are expensive and prone to flakiness.

**Characteristics:**

- Full browser automation with live API
- Tests entire user journeys (real-world user stories)
- Ensures all system parts work together
- Most expensive and slowest tests

**When to Write:**

- Complete end-to-end user flows spanning multiple resources
- Real-world user stories (e.g., "As a user, I want to launch a playbook from a Git repo")
- Validating that integration-tested parts work together as a complete system

**Distinction from Integration Tests:**
Integration tests focus on API interactions for individual resources or specific workflows. UAT tests validate complete user stories spanning multiple resources, ensuring all parts work together.

**Note:** UAT tests are sometimes called "e2e" tests. We use "user-acceptance" to avoid confusion with our integration tests.

---

### Smoke Tests

Smoke tests are a **select subset** of existing tests (not a fifth type) for quick validation that the app is building correctly.

**Purpose:**

- Shorter test suite for fast PR validation
- Basic CRUD operations on each resource type
- Combined with unit and component tests for rapid feedback

**Current Status:**
As of December 2025, we are defining a smoke test suite from our integration tests. These will run quickly to validate PRs without running the entire test suite. Full suite runs nightly or as needed.

---

## Getting Started with Playwright

For detailed setup instructions, environment configuration, and test execution commands, see [playwright/Playwright.md](../../playwright/Playwright.md).

---

### Resource Utilities for Test Dependencies

For comprehensive information about available resource utilities, usage patterns, and best practices, see [CLAUDE.md - Resource-Specific Utilities](../../CLAUDE.md#resource-specific-utilities).

The centralized utilities in `/playwright/utils` follow the `Resource.api.action()` and `Resource.ui.action()` pattern for consistent test data management.

---

## Testing Phases

### Phase 1: Pull Request Validation

**Trigger:** On-demand via PR comment (`/run-aap-ui-playwright`)
**Purpose:** Validate code changes before merge to prevent regressions

**What Runs:**

- All Playwright integration tests (~171 tests as of Sprint 6)
- All Vitest unit/component tests
- Type checking, linting, code formatting

**Infrastructure:**

- Ephemeral AAP Playwright Workflow ([docs](./automating-e2e/ephemeral-aap-playwright.md))
- 4 parallel AAP deployments via `aap-dev`
- Test sharding (4 shards)
- Currents.dev for orchestration
- Runtime: ~55-65 minutes

**Quality Gates (must pass):**

- ✅ All Playwright tests pass
- ✅ All Vitest tests pass
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Code properly formatted (Prettier)
- ✅ 80%+ code coverage (target - not enforced yet)

**Coverage Collection:**

- Playwright: Monocart Coverage Reports (MCR)
- Vitest: Standard coverage tooling
- Reports uploaded as artifacts (SonarQube integration in progress)

**Current State:** Running all Playwright tests regardless of PR changes (see [Future Initiatives](#future-initiatives) for selective test execution)

---

### Phase 2: Post-Merge Nightly Testing

**Trigger:** Nightly, after code merges to `main`
**Purpose:** Validate main branch against all supported AAP deployment types

**What Runs:**

- All Playwright integration tests (full suite)
- Jenkins-deployed AAP instances

**Deployment Types:**

- **AAP 2.7 (current development):** Playwright only
- **AAP 2.6 (stable):** Playwright + Cypress (during migration)
- **AAP 2.5 (older stable):** Playwright + Cypress (during migration)

**Infrastructure:**

- Jenkins CI/CD pipeline
- Multiple deployment types: RPM-B, OCP-B, CONT-B, MAN-B, OCP-A

**Reporting:**

- Jenkins build results
- Currents.dev dashboard
- Separate coverage reports (Playwright and Vitest)

**Success Criteria:**

- All tests pass across all deployment types
- No regressions on main branch

---

### Phase 3: Release Validation

**Trigger:** Prior to major releases
**Purpose:** Final validation before releasing to customers

**What Runs:**

- Full Playwright integration test suite
- Full Vitest unit/component test suite
- Manual exploratory testing (as needed)
- UAT suite (planned - see [Future Initiatives](#future-initiatives))

**Infrastructure:** Jenkins deployments across all supported deployment types

**Success Criteria:**

- 100% test pass rate
- All critical user journeys validated
- No known high-severity bugs

---

## Migration Status

### Cypress → Playwright Migration

**Timeline:** 14 sprints (Sprint 38 - Sprint 52)
**Current Sprint:** Sprint 50 (Sprint 7 of migration)
**Progress:** ~53% complete (246 Cypress tests remaining as of Sprint 6)

**Migration Approach:**

1. Migrate Cypress integration tests → Playwright integration tests
2. Extract testable logic → Vitest unit/component tests
3. Delete original Cypress tests
4. Ensure coverage maintained or improved

**Expected Completion:** Sprint 52 (January 2026)

**During Migration:**

- PR-level testing: Playwright only
- Nightly testing (AAP 2.7): Playwright only
- Nightly testing (AAP 2.6, 2.5): Playwright + Cypress (for coverage)
- Cypress will be fully deprecated after migration completion

---

## Coverage & Quality Gates

### Coverage Targets

**Overall Target:** 80% code coverage

**Coverage Types:**

1. **Vitest Coverage** (unit + component tests)

   - Measures: Line, branch, function coverage
   - Collected via: Vitest built-in tooling
   - Reported separately from Playwright

2. **Playwright Coverage** (integration tests)
   - Measures: Line coverage for code executed during E2E tests
   - Collected via: Monocart Coverage Reports (MCR)
   - Reported separately from Vitest

**Coverage Reporting Status:**

- **Current:** Coverage collected and uploaded as artifacts
- **In Progress:** SonarQube integration for unified reporting
- **Blocker:** Coverage report merging from parallel shards needs debugging

---

### Quality Gates (Pre-Merge)

The following gates must pass before PR merge:

- No Typescript errors
- No linting errors
- No formatting errors
- Component tests pass (Vitest component tests)
- Integration tests pass (Playwright ephemeral flow)
- Coverage threshold verified (in progress)

---

## Infrastructure & Tools

### Testing Tools

| Tool                          | Purpose                           | Documentation                                                                                      |
| ----------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Vitest**                    | Unit & component testing          | [vitest.dev](https://vitest.dev)                                                                   |
| **Playwright**                | Integration/E2E testing           | [playwright.dev](https://playwright.dev)                                                           |
| **Currents.dev**              | Test orchestration & reporting    | [currents.dev](https://currents.dev)                                                               |
| **Cypress**                   | Legacy E2E (being phased out)     | [cypress.io](https://cypress.io)                                                                   |
| **Monocart Coverage Reports** | Playwright coverage collection    | [github.com/cenfun/monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports) |
| **SonarQube**                 | Code quality & coverage (planned) | Internal docs                                                                                      |

---

### CI/CD Infrastructure

**GitHub Actions:**

- **Ephemeral AAP Playwright Workflow**
  - Trigger: PR comment (`/run-aap-ui-playwright`)
  - Deploys 4 parallel AAP instances via `aap-dev`
  - Test sharding (4 shards)
  - Currents.dev orchestration
  - Runtime: ~55-65 minutes
  - [Documentation](./automating-e2e/ephemeral-aap-playwright.md)

**Jenkins:**

- Post-merge nightly testing
- Multiple deployment types: RPM-B, OCP-B, CONT-B, MAN-B, OCP-A
- Full Playwright test suite per deployment type
- Cypress tests on AAP 2.6 and 2.5 (during migration)

**Runner Infrastructure:**

- **GitHub Actions:** `aap-dev` runner group
- **Jenkins:** Dedicated runners per deployment type

---

## Future Initiatives

### 1. Selective Test Execution at PR Level

**Status:** Planned
**Timeline:** TBD (post-migration)

**Goal:** Run only tests affected by PR changes

**Benefits:**

- Faster PR validation (< 15 minutes vs. 55-65 minutes)
- Reduced infrastructure costs
- Faster developer feedback

**Approach:**

- Implement `relevant_test` script ([example](https://gitlab.cee.redhat.com/uxdd/webrh/-/blob/dev/scripts/relevant-tests.js))
- Analyze changed files in PR
- Map changes to affected test files
- Run only affected Playwright tests

**Challenges:**

- Accurately mapping file changes to test coverage
- Handling shared utilities/components
- Ensuring critical regression tests always run

---

### 2. User Acceptance Testing (UAT) Suite

**Status:** Planned (post-migration)
**Timeline:** Post-migration (Sprint 58+)

**Goal:** Define and automate ~30 critical user journeys for release validation

**When to Run:**

- Twice weekly against stable branches
- Before major releases
- As smoke tests for deployment validation

**Scope:**

- End-to-end workflows spanning multiple services
- Critical business processes (e.g., "DevOps engineer deploys application")
- Real-world use cases defined by product management and UX

**Examples:**

- Create organization → add users → assign roles → verify permissions
- Create project → sync → create job template → launch job → verify output
- Configure EDA rulebook → create activation → trigger event → verify action

**Next Steps:**

1. Collaborate with Product Management to define critical user journeys
2. Review previous UAT work (Kia et al's smoke testing)
3. Create separate UAT test suite in Playwright
4. Establish execution schedule (twice weekly)

---

### 3. SonarQube Coverage Integration

**Status:** In progress
**Timeline:** TBD

**Goal:** Automated coverage reporting to SonarQube for all PRs and nightly builds

**Current Blocker:**

- Coverage reports from parallel shards not merging correctly
- Investigation ongoing

**Next Steps:**

1. Debug coverage merging logic in GitHub Actions workflow
2. Verify coverage-final.json format from each shard
3. Test merging locally before deploying to CI
4. Validate SonarQube ingestion

**Expected Metrics:**

- Code coverage (combined Vitest + Playwright)
- Code smells, bugs, vulnerabilities
- Technical debt, duplications

---

### 4. Test Flakiness Detection & Mitigation

**Status:** Ongoing
**Goal:** < 1% flaky test rate

**Tools:**

- Currents.dev flaky test detection
- Playwright retries (currently configured)

**Process:**

1. Currents.dev identifies flaky tests (intermittent failures)
2. Team investigates root cause (timing issues, race conditions)
3. Fix flaky tests or add appropriate waits/assertions
4. Monitor for recurrence

---

### 5. Weekly Regression Testing

**Status:** Not currently implemented

**Rationale:** Full nightly test suites already running, so weekly regression is redundant

**When to Revisit:**

- If nightly testing becomes cost-prohibitive
- If selective test execution is implemented at PR-level
- If test suite grows significantly larger

**Potential Approach:**

- Run full suite weekly on main and release branches
- Run selective tests nightly
- Balance coverage vs. cost

---

## Troubleshooting & Resources

### Common Issues

For general development troubleshooting (build errors, type errors, etc.), see [CLAUDE.md - Troubleshooting](../../CLAUDE.md#troubleshooting).

**Playwright Tests Failing Locally:**

1. Verify AAP instance is running and accessible
2. Check `/playwright/.env` configuration
3. Ensure Playwright browsers installed: `npx playwright install chromium --with-deps`
4. Run with `--debug` flag for step-by-step debugging

**Vitest Tests Failing:**

1. Clear cache: `npm run clean`
2. Reinstall dependencies: `npm ci`
3. Check for missing mocks (should only mock external APIs)

**Coverage Reports Not Generating:**

1. Check workflow logs for errors during coverage collection
2. Verify Monocart Coverage Reports configuration
3. Check artifact uploads in GitHub Actions

**Ephemeral AAP Deployment Failing:**

1. Check runner capacity (multiple PRs may exhaust runners)
2. Verify AAP deployment logs in GitHub Actions
3. Check Red Hat registry credentials

---

### Key Documentation

- [Testing Strategy (this document)](./testing-strategy.md)
- [Ephemeral AAP Playwright Workflow](./automating-e2e/ephemeral-aap-playwright.md)
- [CLAUDE.md - AI Assistant Guidelines](../../CLAUDE.md)
- [Playwright Migration Timeline](https://docs.google.com/spreadsheets/d/MIGRATION_TRACKER)
- [Playwright Migration Sync-Up Agenda](https://docs.google.com/document/d/19vjOeF2wsRhlxOQRIAmpgJEI36Sshdn744gK7_JjGLc/edit)

---

## Appendix: Best Practices

### Writing Good Tests

**DO:**

- Write tests that describe expected behavior
- Use descriptive test names starting with "should"
- Test user-facing functionality, not implementation details
- Use `data-testid` for Playwright selectors (not `data-cy`)
- Clean up test data after test completion
- Use utility functions from `/playwright/commands/` and `/playwright/utils/`

**DON'T:**

- Mock unnecessarily (only mock external APIs)
- Test implementation details (e.g., internal state)
- Write flaky tests (use proper waits and assertions)
- Duplicate test coverage (choose the right test type)
- Skip cleanup (use `test.afterEach` for cleanup)

---

### Playwright-Specific Guidelines

For comprehensive Playwright best practices and guidelines, see:

- [playwright/Playwright.md](../../playwright/Playwright.md) - Best practices for writing Playwright tests (testing like a user, using labels, checking UI state, etc.)
- [CLAUDE.md](../../CLAUDE.md) - Critical technical guidelines (selector patterns, `data-testid` usage, table row selection, API interception, test validation)

---

### Vitest-Specific Guidelines

- **Avoid unnecessary mocks**: Only mock external APIs, browser APIs, or genuinely difficult dependencies
- **Test real behavior**: Don't mock your own utility functions, hooks, or components
- **Use `renderHook` for hook tests**: Test hooks in isolation without rendering full components
- **Prefer component tests over form tests**: For validation logic, test the hook directly

---

**Document Maintained By:** AAP UI Testing Team
**Last Review Date:** December 11, 2025
**Next Review Date:** March 2026 (post-migration completion)
