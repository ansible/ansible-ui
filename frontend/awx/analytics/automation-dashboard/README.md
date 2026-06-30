# Automation Dashboard

The Automation Dashboard is an analytics feature of the Ansible Automation Platform (AAP). It gives users a real-time
view of automation cost savings, job execution trends, host activity, and per-template metrics. Users can filter the
data by time period and resource (template, label, organization, project), export results to CSV, and adjust the
cost-calculation parameters interactively.

---

## Directory structure

```text
automation-dashboard/
├── AutomationDashboard.tsx          # Page entry point
├── AutomationDashboard.test.tsx
├── README.md
├── common/
│   ├── useAutomationDashboardToolbarFilters.tsx   # Async filter hook
│   └── useAutomationDashboardToolbarFilters.test.tsx
├── components/
│   ├── index.ts
│   ├── Toolbar.tsx                  # useAutomationDashboardToolbar hook
│   ├── DashboardValueCard.tsx       # KPI card
│   ├── DashboardTableCard.tsx       # Top-5 ranked list card
│   ├── DashboardChartCard.tsx       # Bar / line chart card
│   ├── DashboardMainTableCard.tsx   # Main editable table card
│   ├── DashboardTableInputField.tsx # Inline numeric input
│   ├── DashboardTableToolbarRow.tsx # Cost controls toolbar
│   └── *.test.tsx
├── constants/
│   ├── index.ts
│   └── DateRange.ts                 # AutomationDashboardDateRangeFilterPresets enum
├── types/
│   └── index.ts                     # All TypeScript interfaces and prop types
└── views/
    ├── useAutomationDashboardView.tsx      # Main view hook (composes all sub-hooks)
    ├── useGetReportDetails.tsx             # Fetches aggregate dashboard data
    ├── useGetReportSubscriptionCosts.tsx   # Fetches subscription cost settings
    ├── useSubscriptionCostState.ts         # Manages local cost state synced with server
    ├── useExportCsv.ts                     # CSV export callback
    └── *.test.ts / *.test.tsx
```

> **Type contracts** — all TypeScript interfaces and prop types live in [`types/index.ts`](./types/index.ts).  
> **Constants** — date-range presets live in [`constants/DateRange.ts`](./constants/DateRange.ts).

---

## Architecture overview

```text
AutomationDashboard (page)
  └── useAutomationDashboardToolbar()   ← builds toolbar filters
  └── useAutomationDashboardView()      ← central data + export hook
        ├── useAwxView                  ← paginated table state
        ├── useGetReportDetails         ← aggregate KPI fetch (SWR)
        ├── useSubscriptionCostState    ← local/remote cost settings sync
        └── useExportCsv                ← CSV download callback
```

All data fetching uses SWR via `useGet`/`useAwxView`. Mutations use `putRequest`/`postRequest` from the framework
helpers.

---

## Entry point

### `AutomationDashboard.tsx`

Top-level page component registered in AAP routing. Renders a `PageToolbar` and a `PageDashboard` grid containing nine
cards:

| Card                          | Component                   |
| ----------------------------- | --------------------------- |
| Successful jobs               | `DashboardValueCard`        |
| Failed jobs                   | `DashboardValueCard`        |
| Hosts automated               | `DashboardValueCard`        |
| Hours of automation           | `DashboardValueCard`        |
| Top 5 projects                | `DashboardTableCard`        |
| Top 5 users                   | `DashboardTableCard`        |
| Hosts jobs are running on     | `DashboardChartCard` (line) |
| Number of times jobs were run | `DashboardChartCard` (bar)  |
| Template cost/savings table   | `DashboardMainTableCard`    |

---

## Components

### `DashboardValueCard`

Displays a single KPI number with an optional unit suffix and an optional navigation link.  
→ See [`DashboardValueCardProps`](./types/index.ts) for the full prop contract.

### `DashboardTableCard`

Renders a compact two-column ranking table (name + count) inside a dashboard card. `items` is optional-chained so the
component is safe when data is absent.  
→ See [`DashboardTableCardProps`](./types/index.ts) and [
`DashboardTableCard.test.tsx`](./components/DashboardTableCard.test.tsx).

### `DashboardChartCard`

Renders a bar or line chart with a large summary number above it. `data.items` is optional-chained so the component is
safe when items are absent. Labels are formatted according to `data.kind` (`hour`, `day`, `month`, `year`).  
→ See [`DashboardChartCardProps`](./types/index.ts) and [
`DashboardChartCard.test.tsx`](./components/DashboardChartCard.test.tsx).

### `DashboardMainTableCard`

Full-width card combining four KPI value cards, the cost-controls toolbar (`DashboardTableToolbarRow`), and a paginated,
sortable job-template table with inline-editable time fields. Edits are saved via a PUT to the `template_metadata`
endpoint and trigger a full refresh before showing the success alert.  
→ See [`DashboardMainTableCard.test.tsx`](./components/DashboardMainTableCard.test.tsx) for interaction examples.

### `DashboardTableToolbarRow`

Renders below the table header. Contains two numeric inputs and a toggle that control the cost-calculation parameters,
plus the **Export as CSV** button. Changes are POSTed to the `subscription_costs` endpoint; 422 field errors are
surfaced beneath the relevant input.  
→ See [`DashboardTableToolbarProps`](./types/index.ts) and [
`DashboardTableToolbarRow.test.tsx`](./components/DashboardTableToolbarRow.test.tsx).

### `DashboardTableInputField`

Controlled numeric text input with inline validation (empty, NaN, integer checks). Calls `onBlur` only when the value
passes all checks.  
→ See [`DashboardTableInputFieldProps`](./types/index.ts).

---

## Views (hooks)

### `useAutomationDashboardView`

The central view hook consumed by `AutomationDashboard`. Composes all sub-hooks and returns
`IAutomationDashboardView`.  
→ See [`useAutomationDashboardView.tsx`](./views/useAutomationDashboardView.tsx) and [
`IAutomationDashboardView`](./types/index.ts).

### `useGetReportDetails`

Fetches aggregate dashboard metrics via SWR. The query string is memoised to prevent redundant re-fetches.  
→ See [`useGetReportDetails.tsx`](./views/useGetReportDetails.tsx) and [
`useGetReportDetails.test.tsx`](./views/useGetReportDetails.test.tsx).

### `useSubscriptionCostState`

Wraps `useGetReportSubscriptionCosts` and manages a local `useState` copy, syncing from the remote value only when it is
defined (prevents undefined flashes during SWR re-fetches).  
→ See [`useSubscriptionCostState.ts`](./views/useSubscriptionCostState.ts).

### `useExportCsv`

Builds a CSV URL, fetches the blob, and triggers a programmatic browser download. Errors are shown via
`usePageAlertToaster`.  
→ See [`useExportCsv.ts`](./views/useExportCsv.ts).

---

## Common

### `useAutomationDashboardToolbarFilters`

Builds async-select toolbar filters for `template`, `label`, `organization`, and `project`. Each filter loads options
from the corresponding `dashboard_reports/*` endpoint with debounced pagination. Search terms are URL-encoded before
being appended.  
→ See [`useAutomationDashboardToolbarFilters.tsx`](./common/useAutomationDashboardToolbarFilters.tsx) and its test.

### `useAutomationDashboardToolbar` (`components/Toolbar.tsx`)

Thin wrapper that prepends the mandatory **Period** single-select filter before passing the rest to
`useAutomationDashboardToolbarFilters`.

---

## Testing

Each source file has a co-located test file (`*.test.tsx` / `*.test.ts`) using **Vitest** + **React Testing Library** +
**MSW v2**.

**Key conventions**

- MSW handlers use **RegExp** or string URL matchers — predicate functions are not supported in MSW v2.
- `server.use(...)` inside individual tests overrides the default handler for that test only; `server.resetHandlers()`
  is called in `afterEach`.
- Rejection assertions use `await expect(...).rejects.toBeInstanceOf(Error)`.
- The AAA pattern (Arrange → Act → Assert) is followed throughout.

**Run tests for this module only**

```bash
npx vitest run frontend/awx/analytics/automation-dashboard
```
