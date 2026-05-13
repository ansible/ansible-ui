# Pull Request Review: Deprecations Dashboard

## Overview

This PR adds a deprecations dashboard to the AWX UI that displays Ansible deprecation warnings from job executions. The feature allows users to:
- View total warnings, affected jobs, and unique deprecation types
- See a heat map of deprecations by severity
- Click deprecation counts to navigate to filtered job lists
- Identify which job templates contain specific deprecations

## Code Quality Validation

### ✅ Passing Checks
- **Prettier**: All files properly formatted
- **ESLint**: No linting errors (max-warnings=0)
- **TypeScript**: Type checking passes with no errors
- **Tests**: Component tests exist and follow AAA pattern

---

## Critical Issues

### 🔴 CRITICAL: Not Using Framework Dashboard Components

**Location**: `frontend/awx/administration/deprecations/DeprecationsDashboard.tsx`

**Issue**: The implementation uses manual Grid layout and raw PatternFly Card components instead of the existing framework components.

**Current Implementation**:
```tsx
<div style={{ padding: 'var(--pf-t--global--spacer--xl)' }}>
  <Grid hasGutter>
    <GridItem span={4}>
      <Card>
        <CardTitle>{t('Total Warnings')}</CardTitle>
        <CardBody>...</CardBody>
      </Card>
    </GridItem>
    {/* ... more manual cards */}
  </Grid>
</div>
```

**Framework Components Available**:
- `PageDashboard` - Responsive grid layout with automatic column calculation
- `PageDashboardCard` - Card component with:
  - Automatic grid column/row spanning
  - Built-in title, subtitle, description support
  - Help icon integration
  - Link support
  - Collapse functionality
  - Proper test IDs (data-cy, data-testid)
  - Consistent spacing and styling

**Evidence**: The Automation Dashboard (`frontend/awx/analytics/automation-dashboard/AutomationDashboard.tsx`) uses these components correctly.

**Recommended Refactor**:
```tsx
import { PageDashboard, PageDashboardCard } from '@ansible/ansible-ui-framework';

return (
  <PageLayout>
    <PageHeader {...} />
    <PageDashboard>
      <PageDashboardCard
        title={t('Total Warnings')}
        width="sm"
        height="sm"
      >
        <div style={{ fontSize: 'var(--pf-t--global--font--size--4xl)' }}>
          {data?.totalWarnings || 0}
        </div>
        <div style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
          {t('From recent job executions')}
        </div>
      </PageDashboardCard>
      
      <PageDashboardCard
        title={t('Deprecation Activity Heat Map')}
        width="lg"
        height="lg"
      >
        {/* heat map content */}
      </PageDashboardCard>
      
      <PageDashboardCard
        title={t('Deprecation Issues')}
        width="lg"
        height="md"
      >
        {/* table content */}
      </PageDashboardCard>
    </PageDashboard>
  </PageLayout>
);
```

**Benefits**:
- Automatic responsive layout (1-24 column grid based on viewport width)
- Consistent with other dashboards in the codebase
- Built-in accessibility features
- Proper test IDs for Playwright/Cypress tests
- Less custom CSS and manual layout code
- Collapse functionality for free

**Impact**: High - This violates the Component Development Guidelines in CLAUDE.md which states:
> "First: Search `/framework` for shared framework components"
> "ALWAYS use PatternFly 6 components as the foundation - never recreate PF components"

---

## High Priority Issues

### ⚠️ HIGH: Manual Styling Should Use Framework Patterns

**Location**: Lines 63-99, 153-166, 241-263 in `DeprecationsDashboard.tsx`

**Issue**: Extensive use of inline styles instead of PatternFly design tokens and framework patterns.

**Current**:
```tsx
<div style={{ padding: 'var(--pf-t--global--spacer--xl)', textAlign: 'center' }}>
  <Spinner size="xl" />
  <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
    {t('Loading deprecation data...')}
  </div>
</div>
```

**Recommendation**: Check if framework has loading state patterns or empty state components. The extensive inline styling suggests custom patterns that may already exist in the framework.

---

### ⚠️ HIGH: Click Handler Accessibility Pattern Could Be Reusable

**Location**: Lines 182-203 in `DeprecationsDashboard.tsx`

**Pattern Detected**: The clickable heat map row pattern with full keyboard accessibility is well-implemented but appears to be a reusable pattern.

**Current Implementation** (20 lines per row):
```tsx
<div
  key={dep.type}
  role="button"
  tabIndex={0}
  style={{ cursor: 'pointer', ... }}
  onClick={() => { navigate(...) }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(...)
    }
  }}
  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '...' }}
  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
>
```

**Question for Consideration**: 
- Is there a framework ClickableRow or similar component?
- Should this be extracted to a custom hook like `useClickableRow(onClick)`?
- Check if PageTable or other framework components have this pattern built-in

**If this pattern is unique**, consider extracting to:
```tsx
// hooks/useClickableDiv.ts
export function useClickableDiv(onClick: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    style: { cursor: 'pointer' },
    onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
  };
}

// Usage:
const clickableProps = useClickableDiv(() => navigate(jobsUrl));
<div {...clickableProps} />
```

---

## Medium Priority Issues

### ⚙️ MEDIUM: Test Coverage - Missing Edge Cases

**Location**: `frontend/awx/administration/deprecations/hooks/useDeprecationData.test.tsx`

**Current Coverage**:
- ✅ Loading state
- ✅ Happy path (categorizes deprecations correctly)
- ✅ Empty results
- ✅ API errors

**Missing Test Cases**:
1. **Jobs with no deprecation events** - The fetcher silently ignores jobs with no events, but this isn't tested
2. **Mixed success/failure** - What happens when some job event fetches fail but others succeed?
3. **Severity calculation edge cases**:
   - Count exactly at thresholds (10, 25, 50)
   - Very high counts (> 100)
4. **jobIds deduplication** - Test that same job with multiple deprecations only appears once in jobIds array
5. **Multiple deprecation types from same job** - Ensure grouping works correctly

**Recommended Additional Tests**:
```typescript
it('should deduplicate job IDs when job has multiple deprecations of same type', async () => {
  const mockEventsJob1 = {
    count: 2,
    results: [
      { /* deprecation 1 - with_items */ },
      { /* deprecation 2 - with_items */ },
    ],
  };
  
  // Expect: jobIds=[1], count=2 (not jobIds=[1,1])
});

it('should handle partial failures in job event fetches', async () => {
  vi.spyOn(Data, 'requestGet')
    .mockResolvedValueOnce(mockJobsResponse) // jobs succeed
    .mockResolvedValueOnce(mockEventsJob1)   // job 1 events succeed
    .mockRejectedValueOnce(new Error('403')); // job 2 events fail
  
  // Should still process job 1 data, not fail entirely
});
```

---

### ⚙️ MEDIUM: Navigation Pattern Repeated (Extract Hook?)

**Location**: Lines 183-194, 294-299 in `DeprecationsDashboard.tsx`

**Pattern**: The "navigate to jobs filtered by IDs" pattern appears twice with identical logic:

```tsx
const jobsUrl = getPageUrl(AwxRoute.Jobs, {
  query: { id__in: dep.jobIds },
});
void navigate(jobsUrl);
```

**Recommendation**: This is only 2 occurrences, but if this pattern appears elsewhere in AWX UI, consider extracting:

```tsx
// hooks/useNavigateToJobsByIds.ts
export function useNavigateToJobsByIds() {
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  
  return useCallback((jobIds: number[]) => {
    const jobsUrl = getPageUrl(AwxRoute.Jobs, {
      query: { id__in: jobIds },
    });
    void navigate(jobsUrl);
  }, [getPageUrl, navigate]);
}

// Usage:
const navigateToJobs = useNavigateToJobsByIds();
onClick={() => navigateToJobs(dep.jobIds)}
```

**Decision**: Check if this pattern exists elsewhere. If it's only these 2 places, no extraction needed.

---

## Low Priority / Suggestions

### 💡 SUGGESTION: Deprecation Type Extraction Could Be More Robust

**Location**: `useDeprecationData.tsx` lines 33-56

**Current**: Uses string matching (`includes()`) on stdout and task names to categorize deprecations.

**Potential Issues**:
- False positives if strings appear in non-deprecation context
- Relies on specific wording that might change in future Ansible versions
- "Other deprecation" catch-all may hide new deprecation types

**Recommendation**: 
- Add logging/telemetry when "Other deprecation" is used to identify new patterns
- Consider parsing Ansible's structured event data if available
- Document the detection patterns in comments for future maintenance

**Not blocking**: Current implementation is functional, this is a future enhancement.

---

### 💡 SUGGESTION: Helper Text Could Be More Prominent

**Location**: Line 251 in `DeprecationsDashboard.tsx`

**Current**: Small, subtle text above the table explaining click behavior:
```tsx
<div style={{
  fontSize: 'var(--pf-t--global--font--size--sm)',
  color: 'var(--pf-t--global--text--color--subtle)',
  marginBottom: 'var(--pf-t--global--spacer--md)',
}}>
  {t('Click on occurrence count to view affected jobs and their templates')}
</div>
```

**Suggestion**: Users might miss this. Consider:
- Using an info icon next to the "Occurrences" column header
- Making links visually obvious (already done with Button variant="link")
- Adding a tooltip on first hover

**Not blocking**: Current implementation is clear enough, this is UX polish.

---

## Positive Highlights

### ✅ Excellent Accessibility Implementation

The clickable heat map rows have exemplary keyboard accessibility:
- Proper ARIA roles (`role="button"`)
- Keyboard navigation (Enter/Space key support)
- Focus management (`tabIndex={0}`)
- Visual feedback (hover states)

This is better than many existing patterns in the codebase.

---

### ✅ Smart Data Fetching Strategy

The `useDeprecationData` hook uses a clean SWR pattern with custom fetcher:
- Single SWR call with N+1 query handled internally via Promise.all
- Proper error handling (silently skip inaccessible jobs)
- Automatic refresh every 60 seconds
- No waterfall requests (parallel fetching)

This is an appropriate solution given API constraints.

---

### ✅ Proper i18n Usage

All user-facing strings properly use `t()` function:
- No hardcoded English strings in JSX
- Descriptive translation keys
- Follows project conventions

---

### ✅ Test Structure Follows AAA Pattern

Tests in `useDeprecationData.test.tsx` follow Arrange-Act-Assert pattern:
```typescript
it('should fetch and categorize deprecations', async () => {
  // Arrange
  const mockJobsResponse = { ... };
  vi.spyOn(Data, 'requestGet').mockResolvedValueOnce(...);
  
  // Act
  const { result } = renderHook(() => useDeprecationData());
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  
  // Assert
  expect(result.current.data?.totalWarnings).toBe(4);
});
```

Clean and maintainable.

---

## Files Review Summary

### New Files Added

| File | Status | Notes |
|------|--------|-------|
| `DeprecationsDashboard.tsx` | ⚠️ Needs Refactor | Use PageDashboard/PageDashboardCard |
| `Deprecations.tsx` | ✅ Good | Proper PageLayout/PageHeader usage |
| `useDeprecationData.tsx` | ✅ Good | Clean hook implementation |
| `useDeprecationData.test.tsx` | ⚠️ Needs More Tests | Add edge case coverage |
| `Deprecations.test.tsx` | ✅ Good | Basic smoke test |
| `useAwxDeprecationsRoutes.tsx` | ✅ Good | Follows routing patterns |

### Modified Files

| File | Status | Notes |
|------|--------|-------|
| `AwxRoutes.tsx` | ✅ Good | Added Deprecations route |
| `useAwxNavigation.tsx` | ✅ Good | Added to Administration section for all users |

### Test/Documentation Files

All Ansible playbooks and markdown docs are for testing the feature. These look comprehensive and well-documented.

---

## Recommendations Summary

### Must Fix (Before Merge)

1. **Refactor to use `PageDashboard` and `PageDashboardCard`** - Critical framework component reuse issue

### Should Fix (High Priority)

2. **Add missing test cases** - Edge cases for job ID deduplication, partial failures, threshold values
3. **Review if clickable row pattern should be extracted** - Check if similar patterns exist elsewhere

### Nice to Have (Low Priority)

4. Consider extracting navigation hook if pattern appears elsewhere
5. Add telemetry for "Other deprecation" catch-all
6. Consider UX improvements for helper text visibility

---

## Architecture Analysis

### ✅ Correct Decisions

- **No new API endpoints needed** - Smart use of existing `/jobs/{id}/job_events/?event=deprecated` endpoint
- **Proper workspace location** - Feature is AWX-specific, correctly placed in `/frontend/awx/`
- **Framework integration** - Uses PageLayout, PageHeader, useGetPageUrl correctly
- **Accessibility** - Keyboard navigation properly implemented

### ❌ Incorrect Patterns

- **Manual dashboard layout** - Should use framework PageDashboard components (see CLAUDE.md Component Development Guidelines)
- **Custom card components** - Should use PageDashboardCard instead of raw PatternFly Card

### 🤔 Questions for Discussion

1. Should the deprecation type detection logic be configurable/extensible?
2. Is 20 jobs the right limit, or should it be configurable?
3. Should there be a way to dismiss/acknowledge specific deprecations?

---

## Before/After Example

### Current Implementation

```tsx
<div style={{ padding: 'var(--pf-t--global--spacer--xl)' }}>
  <Grid hasGutter>
    <GridItem span={4}>
      <Card>
        <CardTitle>{t('Total Warnings')}</CardTitle>
        <CardBody>
          <div style={{ fontSize: '...', fontWeight: '...' }}>
            {data?.totalWarnings || 0}
          </div>
        </CardBody>
      </Card>
    </GridItem>
  </Grid>
</div>
```

### Recommended Implementation

```tsx
<PageDashboard>
  <PageDashboardCard
    title={t('Total Warnings')}
    subtitle={t('From recent job executions')}
    width="sm"
    height="sm"
  >
    <div style={{ fontSize: 'var(--pf-t--global--font--size--4xl)' }}>
      {data?.totalWarnings || 0}
    </div>
  </PageDashboardCard>
</PageDashboard>
```

**Benefits**: 12 lines → 8 lines, responsive layout, consistent styling, built-in test IDs

---

## Final Verdict

**Status**: ⚠️ **NEEDS CHANGES**

**Blocking Issues**: 
- Must refactor to use framework dashboard components

**Overall**: The feature implementation is solid with good accessibility, testing, and data fetching patterns. However, it violates the Component Development Guidelines by not using existing framework components. This should be corrected before merge to maintain consistency with the codebase.

**Effort to Fix**: ~2 hours to refactor dashboard layout to use PageDashboard/PageDashboardCard

---

## Testing Checklist (For User Manual Validation)

Before merging, manually verify in browser:

- [ ] Dashboard loads without console errors
- [ ] Stats cards display correct counts
- [ ] Heat map shows deprecations sorted by count
- [ ] Clicking heat map row navigates to filtered jobs
- [ ] Clicking occurrence count navigates to filtered jobs  
- [ ] Keyboard navigation works (Tab, Enter, Space on heat map rows)
- [ ] Hover states work on heat map rows
- [ ] Empty state displays when no deprecations found
- [ ] Loading spinner displays during initial fetch
- [ ] Data refreshes every 60 seconds
- [ ] Navigation item appears in Administration section
- [ ] Page header help text displays correctly

---

**Generated by**: Claude Code PR Review
**Date**: 2026-05-12
