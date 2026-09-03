# Automation Dashboard

The Automation Dashboard is an analytics feature of the Ansible Automation Platform (AAP). It is a
tabbed page:

- **Dashboard** — real-time view of automation cost savings, job execution trends, host activity,
  and per-template metrics. Users can filter the data by time period and resource (template, label,
  organization, project), export results to CSV, and adjust the cost-calculation parameters
  interactively.
- **Leaderboards** — enterprise "at a glance" summary, automation streaks, per-dimension user
  leaderboards, an organizations leaderboard, and 30-day achievement badges.
  **The Leaderboards tab currently renders mock data** — see
  [`views/useAutomationLeaderboardsView.ts`](./views/useAutomationLeaderboardsView.ts).

---

## Directory structure

```text
automation-dashboard/
├── AutomationDashboardMainPage.tsx  # Tabbed page shell (route entry point)
├── AutomationDashboard.tsx          # "Dashboard" tab
├── AutomationLeaderboards.tsx       # "Leaderboards" tab
├── AutomationDashboard.css          # Styles for leaderboard visuals (streak strip, badges)
├── README.md
├── common/                          # Hooks: data views, toolbar filters, filter-set CRUD, grid sizing
│   ├── useAutomationDashboardBaseView.ts
│   ├── useAutomationDashboardCollectionStatus.tsx
│   ├── useAutomationDashboardToolbarFilters.tsx
│   ├── useAutomationDashboardToolbarActions.tsx
│   ├── useCreateToolbarFilterSet.tsx / useUpdateToolbarFilterSet.tsx / useRemoveToolbarFilterSet.tsx
│   ├── useCreateEditToolbarFilterSetDialog.tsx
│   └── useDashboardGridColumns.tsx  # Measures the responsive grid column count
├── components/
│   ├── index.ts
│   ├── Toolbar.tsx                  # useAutomationDashboardToolbar hook
│   ├── DashboardToolbar.tsx         # Filter toolbar + "Select report" filter-set control
│   ├── DashboardLayout.tsx          # Scrollable grid wrapper + DashboardGridRow
│   ├── DashboardValueCard.tsx       # KPI card
│   ├── DashboardDetailsCard.tsx     # KPI card rendered as a PageDetail
│   ├── DashboardCardValue.tsx       # Shared value formatting / font-size helper
│   ├── DashboardChartCard.tsx       # Bar / line chart card
│   ├── DashboardMainTableCard.tsx   # Main editable cost/savings table card
│   ├── DashboardTableToolbarRow.tsx # Cost controls + Export CSV
│   ├── DashboardTableInputField.tsx # Inline numeric input
│   ├── DashboardExportButton.tsx    # CSV export split button
│   └── leaderboards/                # "Leaderboards" tab components (mock data via the view hook)
│       ├── AutomationAtAGlance.tsx
│       ├── AtAGlanceKpiMetric.tsx
│       ├── AutomationDimensions.tsx
│       ├── HighlightsLeaderboardPanel.tsx
│       ├── HighlightsSyncTimestamp.tsx
│       ├── MilestoneBadgesCard.tsx
│       ├── StreakDayStrip.tsx
│       ├── LeaderboardRankCell.tsx
│       ├── DashboardSectionHeading.tsx
│       └── DashboardMetricsText.tsx
├── constants/
│   ├── index.ts
│   ├── common.ts                    # DEFAULT_NUMBER_LOCALE
│   └── DateRange.ts                 # AutomationDashboardDateRangeFilterPresets enum
├── types/
│   └── index.ts                     # Dashboard data models and prop types
├── utils/
│   ├── queryString.ts               # Filter <-> query-string helpers
│   └── persistedFilterState.ts      # Per-user sessionStorage persistence of toolbar state
└── views/                           # Data / state hooks
    ├── useAutomationDashboardView.tsx      # Dashboard tab: central data + export hook
    ├── useAutomationLeaderboardsView.ts    # Leaderboards tab: single data source (mock for now)
    ├── useFilterSetView.tsx                # "Select report" async filter-set dropdown state
    ├── useGetReportDetails.tsx             # Fetches aggregate dashboard data (SWR)
    ├── useGetReportSubscriptionCosts.tsx   # Fetches subscription cost settings
    ├── useSubscriptionCostState.ts         # Local cost state synced with server
    └── useExportCsv.ts                     # CSV export callback
```

> **Type contracts** — dashboard interfaces live in [`types/index.ts`](./types/index.ts); the
> Leaderboards data contract lives with its hook in
> [`views/useAutomationLeaderboardsView.ts`](./views/useAutomationLeaderboardsView.ts).
> **Constants** — date-range presets in [`constants/DateRange.ts`](./constants/DateRange.ts).

---

## Routing

Registered in `useAwxNavigation` under `analytics/automation-dashboard`:

| Route id                               | Path                                | Element                       |
| -------------------------------------- | ----------------------------------- | ----------------------------- |
| `AwxRoute.AutomationDashboardMainPage` | `automation-dashboard`              | `AutomationDashboardMainPage` |
| `AwxRoute.AutomationDashboard`         | `automation-dashboard/dashboard`    | `AutomationDashboard`         |
| `AwxRoute.AutomationLeaderboards`      | `automation-dashboard/leaderboards` | `AutomationLeaderboards`      |

The index path redirects to `dashboard`.

---

## Architecture overview

```text
AutomationDashboardMainPage (page shell — stays mounted across tab switches)
  ├── useAutomationDashboardCollectionStatus()   ← gates the loading state
  ├── useDashboardGridColumns()                  ← measures the grid column count once
  └── PageDashboardContext.Provider { columns }
        └── PageRoutedTabs
              ├── AutomationDashboard        (Dashboard tab)
              │     ├── useAutomationDashboardToolbar()   ← toolbar filters
              │     ├── useAutomationDashboardView()      ← central data + export hook
              │     │     ├── useAutomationDashboardBaseView   ← paginated table state (SWR)
              │     │     ├── useGetReportDetails              ← aggregate KPI fetch (SWR)
              │     │     ├── useSubscriptionCostState         ← local/remote cost settings sync
              │     │     └── useExportCsv                     ← CSV download callback
              │     ├── <DashboardToolbar>
              │     └── <DashboardLayout> → DashboardGridRow × 3
              └── AutomationLeaderboards     (Leaderboards tab)
                    ├── useAutomationLeaderboardsView()   ← single data source (mock for now)
                    └── <DashboardLayout> → DashboardGridRow × 4
```

All real data fetching uses SWR via `useGet` / `useAutomationDashboardBaseView`. Mutations use
`putRequest` / `postRequest` from the framework helpers.

### Responsive grid

`useDashboardGridColumns` (in the persistent page shell) measures a zero-height probe element and
derives a column count, published through `PageDashboardContext`. Measuring in the shell rather than
inside each tab means switching tabs never re-measures or flashes the grid. Each tab wraps its
content in `<DashboardLayout>` (a `<Scrollable>` + CSS grid) and lays out full-width rows with
`<DashboardGridRow>`; `PageDashboardCard` reads the same column count to pick its span.

---

## Entry point

### `AutomationDashboardMainPage.tsx`

The tabbed page shell. Shows a `LoadingState` while the collection status is loading, otherwise a
`PageHeader` and the `Dashboard` / `Leaderboards` tabs via `PageRoutedTabs`.

### `AutomationDashboard.tsx` (Dashboard tab)

Renders `<DashboardToolbar>` and a `<DashboardLayout>` grid of:

| Card                                | Component                   |
| ----------------------------------- | --------------------------- |
| Successful jobs                     | `DashboardValueCard`        |
| Failed jobs                         | `DashboardValueCard`        |
| Hosts automated                     | `DashboardValueCard`        |
| Hours of automation                 | `DashboardValueCard`        |
| Number of hosts jobs are running on | `DashboardChartCard` (line) |
| Number of times jobs were run       | `DashboardChartCard` (bar)  |
| Template cost/savings table         | `DashboardMainTableCard`    |

### `AutomationLeaderboards.tsx` (Leaderboards tab)

Renders a `<DashboardLayout>` grid of `HighlightsSyncTimestamp`, `AutomationAtAGlance`,
`AutomationDimensions`, `HighlightsLeaderboardPanel`, and `MilestoneBadgesCard`. Card widths adapt
to the measured grid column count.

---

## Components — Dashboard tab

### `DashboardValueCard` / `DashboardDetailsCard`

Display a single KPI number with an optional unit suffix and an optional navigation link. Value
formatting and responsive font sizing are shared through `DashboardCardValue`.
→ See [`DashboardValueCardProps`](./types/index.ts).

### `DashboardChartCard`

Renders a bar or line chart with a large summary number above it. `data.items` is optional-chained
so the component is safe when items are absent. Labels are formatted according to `data.kind`
(`hour`, `day`, `month`, `year`).
→ See [`DashboardChartCardProps`](./types/index.ts).

### `DashboardMainTableCard`

Full-width card combining four KPI value cards, the cost-controls toolbar
(`DashboardTableToolbarRow`), and a paginated, sortable job-template table with inline-editable time
fields. Edits are saved via a PUT to the `template_metadata` endpoint and trigger a full refresh
before showing the success alert.

### `DashboardTableToolbarRow` / `DashboardTableInputField` / `DashboardExportButton`

Cost-calculation controls (two numeric inputs + a toggle) and the **Export as CSV** split button.
Changes are POSTed to the `subscription_costs` endpoint; 422 field errors are surfaced beneath the
relevant input. `DashboardTableInputField` calls `onBlur` only when the value passes its inline
validation (empty, NaN, integer checks).

### `DashboardToolbar`

The filter toolbar plus the **Select report** control that loads, applies, creates, updates, and
removes saved filter sets (`useFilterSetView` + the `common/use*ToolbarFilterSet` hooks).

---

## Components — Leaderboards tab (`components/leaderboards/`)

All of these read their data from `useAutomationLeaderboardsView()` — there are no hardcoded values
in the components themselves.

| Component                                          | Shows                                                                                         |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `AutomationAtAGlance`                              | Enterprise KPI tiles (`AtAGlanceKpiMetric`) + enterprise/org streak strips (`StreakDayStrip`) |
| `AutomationDimensions`                             | Three automation-dimension scores with a click-to-switch per-dimension top-10 leaderboard     |
| `HighlightsLeaderboardPanel`                       | Top-10 organizations table with the current org's standing in the header                      |
| `MilestoneBadgesCard`                              | 30-day user and org achievement badges (earned sorted first)                                  |
| `HighlightsSyncTimestamp`                          | "last synced" line above the cards                                                            |
| `LeaderboardRankCell`                              | Shared medal-styled rank cell (#1–#3 get a colored crown)                                     |
| `DashboardSectionHeading` / `DashboardMetricsText` | Shared small typographic primitives                                                           |

Streak-cell and badge colors that PatternFly does not tokenize live in `AutomationDashboard.css`
(mapped to PF design tokens where a token exists).

---

## Views (hooks)

### `useAutomationDashboardView`

The central view hook consumed by the Dashboard tab. Composes the sub-hooks and returns
`IAutomationDashboardView`. Also seeds and persists the toolbar filter state per user (see
**Session persistence** below).

### `useAutomationLeaderboardsView`

**Single source of data for the Leaderboards tab.** Owns the data contract (types) and, for now, a
`MOCK_LEADERBOARDS` constant; the hook returns `{ ...mock, isLoading: false, error: undefined }`.
When the analytics API exposes a leaderboards report, replace the hook body with a `useSWR` /
`useGet` call (pattern: `useGetReportDetails`) that resolves to `AutomationLeaderboardsData` — the
components consume only this hook, so nothing else changes. Marked with a `TODO(api)` comment.

### `useFilterSetView`

State for the "Select report" async-select dropdown (options, selection, version). Seeds and
persists the selected filter set per user.

### `useGetReportDetails` / `useGetReportSubscriptionCosts` / `useSubscriptionCostState` / `useExportCsv`

Aggregate metrics fetch (memoised query string), subscription-cost settings fetch, the local cost
state that syncs from the remote value only when defined, and the CSV URL + programmatic download
callback (errors surfaced via `usePageAlertToaster`).

---

## Common (hooks)

### `useDashboardGridColumns`

Measures a full-width, zero-height probe element and derives the responsive dashboard grid column
count. Measurements below one column (hidden / not yet laid out) are ignored so the grid never
collapses to one column.

### `useAutomationDashboardToolbarFilters` / `useAutomationDashboardToolbar`

`useAutomationDashboardToolbarFilters` builds async-select toolbar filters for `template`, `label`,
`organization`, and `project`, each loading options from the corresponding `dashboard_reports/*`
endpoint with debounced pagination. `useAutomationDashboardToolbar` (`components/Toolbar.tsx`)
prepends the mandatory **Period** single-select filter.

### `useAutomationDashboardCollectionStatus`

Fetches the analytics collection status; drives the page-shell loading state.

### `use{Create,Update,Remove}ToolbarFilterSet` / `useCreateEditToolbarFilterSetDialog`

CRUD for the saved "report" filter sets behind the Select report control.

---

## Session persistence (`utils/persistedFilterState.ts`)

The dashboard toolbar state is persisted to `sessionStorage`, **keyed per active user**
(`...:<userId>`, id from `useAwxActiveUser`), so switching to the Leaderboards tab and back keeps
the filters while logging out and back in as a different user on the same tab does not leak them:

- `awx-automation-dashboard-filter-state:<userId>` — the toolbar `filterState`. Seeded into
  `useAutomationDashboardView`, re-seeded / reset when the active user changes, and written on every
  change. A deep link (filter keys present in `window.location.search` at mount) wins on first seed.
- `awx-automation-dashboard-filter-set:<userId>` — the selected "Select report" filter set. Seeded
  into `useFilterSetView` the same way; cleared on deselect.

Untrusted JSON is validated with the `isFilterStateShape` / `isDashboardFilterSetShape` guards
before use. All writes are best-effort (wrapped in try/catch for private browsing / quota).

---

## Testing

Most source files have a co-located test file (`*.test.tsx` / `*.test.ts`) using **Vitest** +
**React Testing Library** + **MSW v2**. The Leaderboards tab (`AutomationLeaderboards`,
`components/leaderboards/*`, `useAutomationLeaderboardsView`) is not covered yet — tests are
pending alongside the real API wiring.

**Key conventions**

- MSW handlers use **RegExp** or string URL matchers — predicate functions are not supported in
  MSW v2.
- `server.use(...)` inside a test overrides the default handler for that test only;
  `server.resetHandlers()` runs in `afterEach`.
- Hook tests that touch persistence mock `../../../common/useAwxActiveUser` and call
  `sessionStorage.clear()` between tests.
- Rejection assertions use `await expect(...).rejects.toBeInstanceOf(Error)`.
- The AAA pattern (Arrange → Act → Assert) is followed throughout.

**Run tests for this module only**

```bash
npx vitest run frontend/awx/analytics/automation-dashboard
```
