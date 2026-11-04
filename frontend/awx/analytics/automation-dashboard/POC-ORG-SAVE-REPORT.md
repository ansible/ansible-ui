# POC — Gate Save-Report Actions on Organization Change Permission

Branch: `poc/org-dashboard-save-report`
Base: `feat/organization-dashboard-rbac` (Option B PR #3644)
Draft PR: https://github.com/ansible/ansible-ui/pull/3861

## Purpose

The Option B dashboard maps existing Gateway roles to dashboard capabilities:

| Gateway role | Permission | Dashboard capability |
|---|---|---|
| Organization Member | `member_organization` | View dashboard data |
| Organization Admin | `change_organization` | View + edit dashboard data |

This branch makes the dashboard's **save-report** actions (create / update /
delete) follow the `change_organization` capability instead of the old
`is_superuser`-only rule. View-only organization members can browse the
dashboard, but cannot save reports. Mixed scopes remove the save option when
any selected organization is view-only.

## Behavior

`getCanSaveReports(access, filterState, isPlatformSuperuser, isPlatformAuditor)`
returns `True` when:

- the caller is a platform superuser; or
- the caller has organization scope and every organization the report covers
  has `can_edit === true`.

It returns `False` when:

- the caller is a platform auditor (read-only, even with global visibility);
- the caller has only global scope but is not a superuser;
- any selected organization has `can_edit === false`;
- a selected organization is not present in the access response;
- the selection is empty and not every visible organization is editable.

When no organization filter is selected, the report spans every visible
organization, so all of them must be editable.

## Files changed

### `common/useAutomationDashboardAccess.ts`

- Added `getCanSaveReports()`, derived from the per-organization `can_edit`
  value returned by `/dashboard_reports/access/`.
- No change to the existing `getDashboardSettingsContext()`.

### `views/useAutomationDashboardView.tsx` and `types/index.ts`

- Expose `canSaveReports` on `IAutomationDashboardView`, memoized from the
  current access response and filter state.

### `AutomationDashboard.tsx` → `components/DashboardToolbar.tsx`

- Pass `view.canSaveReports` into the toolbar.

### `common/useAutomationDashboardToolbarActions.tsx`

- Added an optional `canSaveReports` prop.
- When provided, create/update/delete report actions are gated on it:
  - save/edit message: "You need change permission on the selected
    organizations to save reports";
  - delete message: "You need change permission on the selected organizations
    to delete reports".
- When omitted, the hook keeps the legacy superuser-only behavior so existing
  consumers and tests are unaffected.

### Tests

- `common/useAutomationDashboardAccess.test.tsx`: superuser, auditor, global
  scope, view-only, single editable, single view-only, mixed selection,
  all-editable scope, and unknown-organization cases.
- `views/useAutomationDashboardView.test.tsx`: `canSaveReports` is exposed for
  editable, read-only, superuser and auditor contexts.
- `common/useAutomationDashboardToolbarActions.test.tsx`: enabled for an
  organization editor, disabled with the change-permission message for a
  view-only member, plus the legacy fallback tests.
- Test fixtures updated for the new required view field.

## Validation

```bash
./node_modules/.bin/vitest run \
  frontend/awx/analytics/automation-dashboard/common/useAutomationDashboardAccess.test.tsx \
  frontend/awx/analytics/automation-dashboard/common/useAutomationDashboardToolbarActions.test.tsx \
  frontend/awx/analytics/automation-dashboard/views/useAutomationDashboardView.test.tsx \
  frontend/awx/analytics/automation-dashboard/AutomationDashboard.test.tsx \
  frontend/awx/analytics/automation-dashboard/components/DashboardMainTableCard.test.tsx
# 127 passed

./node_modules/.bin/tsc --noEmit -p frontend/awx/tsconfig.json
./node_modules/.bin/eslint frontend/awx/analytics/automation-dashboard
./node_modules/.bin/prettier --check "frontend/awx/analytics/automation-dashboard/**/*.{ts,tsx}"
```

## Dependencies and limitations

- Depends on the Option B dashboard access endpoint returning per-organization
  `can_edit` (ansible-ui PR #3644 / metrics-service PR #441).
- The server-side counterpart is metrics-service PR #525, which rejects
  report writes with HTTP 403 for the same scenarios.
- Organization-scoped data still requires **metrics-utility** to populate
  `organization_ansible_id` in its historical and hourly dashboard collectors;
  without it, org-scoped users see an empty dashboard.
- The save option is disabled rather than removed from the DOM, matching the
  existing toolbar-action pattern. The capability is not available either way.
