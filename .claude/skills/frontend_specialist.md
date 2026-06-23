# Frontend Specialist

Standards for implementing, reviewing, and refactoring frontend code in this
React 18 + TypeScript + PatternFly 6 monorepo.

Load this skill before implementing, reviewing, or refactoring any frontend code.

---

## Step 1: Read Project Standards First

Before writing any code, read these skills in order:

1. **`.claude/skills/coding_standards.md`** — API helpers, PageForm wrappers,
   view hooks, error adapters, CRUD hooks, framework component inventory,
   RBAC helpers, ESLint rules
2. **`.claude/skills/testing_guidelines.md`** — Vitest + MSW patterns, accessible
   queries, userEvent, FormProvider wrappers, hook testing, mock fixtures
3. **`.claude/skills/library_references.md`** — Fetch llms.txt for any library
   you are about to use (React, Vitest, Vite, Zustand)

---

## Step 2: Identify the Workspace

This monorepo has 7 workspaces. Identify which one you are working in before
writing code — each has its own API helper, PageForm wrapper, error adapter,
view hook, and response format.

| Workspace    | Directory           | API Helper   | PageForm Wrapper  | View Hook      | Response Format                              |
| ------------ | ------------------- | ------------ | ----------------- | -------------- | -------------------------------------------- |
| **AWX**      | `frontend/awx/`     | `awxAPI`     | `AwxPageForm`     | `useAwxView`   | `{ count, results, next, previous }`         |
| **EDA**      | `frontend/eda/`     | `edaAPI`     | `EdaPageForm`     | `useEdaView`   | `{ count, results }`                         |
| **Hub**      | `frontend/hub/`     | `hubAPI`     | `HubPageForm`     | `useHubView`   | Galaxy: `{ meta, data, links }` or Pulp: `{ count, results }` |
| **Platform** | `platform/`         | `gatewayAPI` | `PlatformPageForm`| —              | Varies                                       |
| **Framework**| `framework/`        | —            | `PageForm` (base) | `useView`      | —                                            |
| **Common**   | `frontend/common/`  | —            | —                 | —              | —                                            |
| **Chatbot**  | `frontend/chatbot/` | —            | —                 | —              | —                                            |

Key differences:
- **AWX** requires `T extends { id: number }`
- **EDA** supports `T extends { id: number | string }`
- **Hub** requires an explicit `keyFn` prop and handles two response formats
- **Platform** reuses AWX error adapter by default but accepts overrides

---

## Step 3: Check for Existing Components

Before creating anything new, search in this order:

### 1. Framework (`/framework/`) — 79+ exports

**Page Structure**: PageLayout, PageBody, PageHeader, PageMasthead, PageNavigation,
PageApp, PageFramework, PageTabs, PageTitle

**Data Display**: PageTable (with table/list/card views), PageDetails,
PageDetailsFromColumns, PageDashboard, PageDashboardCard, PageDashboardChart,
PageDashboardCount

**Forms**: PageForm + 20 input types (TextInput, TextArea, Select,
SingleSelect, MultiSelect, AsyncSingleSelect, AsyncMultiSelect,
CreatableSelect, Checkbox, Switch, DataEditor, Secret, DateTimePicker,
FileUpload, Slider, ToggleGroup, Markdown, MultiInput)

**Dialogs**: PageDialog, BulkActionDialog, BulkConfirmationDialog,
MultiSelectDialog, useSelectDialog

**Wizards**: PageWizard, PageWizardStep, usePageWizard()

**Actions**: PageAction, PageActions (types: Button/Link/Switch/Dropdown/Separator,
selections: None/Single/Multiple)

**Toolbar**: PageToolbar + filters (Text, SingleSelect, MultiSelect,
AsyncSingleSelect, AsyncMultiSelect, DateRange)

**Empty States**: PageNotFound, PageNotImplemented, EmptyStateError,
EmptyStateNoData, EmptyStateFilter, EmptyStateUnauthorized

**Notifications**: PageAlertToaster, usePageAlertToaster()

**Cell Renderers**: TextCell, DateTimeCell, BytesCell, ElapsedTimeCell,
LabelsCell, CopyCell

**Hooks**: useView, useInMemoryView, usePageSettings, usePageNavigate,
useGetPageUrl, usePageDialogs, usePageAlertToaster, useBreakPoint, useID,
useClipboard, useAbortController

**Utilities**: LoadingPage, Scrollable, ErrorBoundary, Collapse, Help,
StandardPopover, BulkSelector, RunningIcon, pfcolors

### 2. PatternFly 6

Check [patternfly.org/components](https://www.patternfly.org/components/all-components/)
for components not in the framework.

### 3. Workspace Components

`frontend/{awx,eda,hub}/components/` — workspace-specific UI pieces.

### 4. Common Utilities (`frontend/common/`)

- **CRUD hooks**: useGet, usePostRequest, usePutRequest, usePatchRequest,
  useDeleteRequest, useOptions
- **Cache**: useClearCache, useInvalidateCacheOnUnmount
- **RBAC**: cannotEditResource, cannotDeleteResource, cannotCopyResource
- **Columns**: useIdColumn, useNameColumn, useDescriptionColumn, useLastRanColumn
- **Key functions**: nameKeyFn, idKeyFn
- **Polling**: poll()
- **Virtual scrolling**: useVirtualizedList
- **Validation**: useIsValidUrl
- **Access control**: ResourceAccess, UserAccess, TeamAccess, ManageResourceRoles,
  useResourceRolesActions

Only create new components as a last resort.

---

## Step 4: Core Standards

### React 18
- Functional components only, proper hook patterns
- Component composition over prop drilling
- Controlled components via React Hook Form (through PageForm wrappers)
- `Readonly<Props>` for all component props (SonarCloud S6759)
- No nested component declarations (SonarCloud S6478) — extract to module scope

### TypeScript
- Never use `any` — use `unknown` and narrow with type guards
- Leverage type inference; explicit types where clarity demands
- `as const` for literal narrowing
- Utility types: `Partial`, `Pick`, `Omit`, `Record`
- No unsafe `as` casts on API responses — use typed CRUD hooks

### PatternFly 6
- Use PF6 components as foundation — never recreate existing PF components
- Use PF6 layout components (Stack, Flex, Grid) for spacing
- Use PF6 design tokens where available, not hardcoded px values

### SWR
- Use `useSWR` with workspace API helpers for all data fetching
- Global `SWRConfig` in `PageSettingsProvider` sets `dedupingInterval: 2000`
- Use hook-based CRUD (`usePostRequest`, etc.) — they auto-invalidate cache
- Use `useAwxGetAllPages` when you need all items across pages

### Internationalization
- All user-facing strings wrapped in `t()` from `useTranslation`
- Never compare translated display strings in logic — compare raw API values
- ESLint enforces `i18next/no-literal-string` on JSX attributes
- See CLAUDE.md i18n section for full patterns

### ESLint Rules
- `eqeqeq: "error"` — strict equality always
- `no-console: "error"` — no console.log in production
- `no-only-tests: "error"` — no test.only() committed
- No default exports — use named exports
- Hardcoded API paths are ESLint errors — use tagged template helpers
- `jsx-a11y/recommended` — accessibility enforced

---

## Step 5: Pre-Submission Checklist

### API and Data
- [ ] No hardcoded API paths — using `awxAPI`/`edaAPI`/`hubAPI`/`gatewayAPI`
- [ ] CRUD operations use hooks from `frontend/common/crud/`
- [ ] SWR for data fetching with `swrOptions`
- [ ] Error handling uses workspace error adapter or error parser hook

### Forms
- [ ] Using workspace PageForm wrapper (`AwxPageForm`/`EdaPageForm`/`HubPageForm`/`PlatformPageForm`)
- [ ] Form inputs from `framework/PageForm/Inputs/` — not custom inputs
- [ ] No manual `useState` per field — React Hook Form handles state
- [ ] `setFieldError` used for field-specific validation in `onSubmit`

### Components
- [ ] Checked `/framework` (79+ exports) before creating new components
- [ ] Checked PatternFly 6 component library
- [ ] List views use workspace view hooks (`useAwxView`/`useEdaView`/`useHubView`)
- [ ] `ITableColumn<T>` and `IPageAction<T>` types for tables and actions
- [ ] RBAC checks via `cannotEditResource`/`cannotDeleteResource`
- [ ] `Readonly<Props>` on all component props
- [ ] No nested component declarations — extract to module scope

### Testing
- [ ] Tests use `userEvent.setup()` — not `fireEvent`
- [ ] MSW for API mocking — not function mocks
- [ ] Accessible queries: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- [ ] New hooks have dedicated test files
- [ ] FormProvider wrapper for components that need form context

### Code Quality
- [ ] No `any` types
- [ ] No `console.log`
- [ ] All user-facing strings wrapped in `t()`
- [ ] No default exports
- [ ] Named route enum values used for navigation

### Quality Gates
- [ ] TypeScript passes: `npm run tsc`
- [ ] ESLint passes: `npm run eslint`
- [ ] Prettier applied: `npm run prettier:fix`
- [ ] Tests pass: `npm run vitest`

---

## Step 6: Implementation Workflow

1. Read the skills (coding_standards, testing_guidelines, library_references)
2. Identify the correct workspace for the work
3. Search for existing framework/PF/common components before creating new ones
4. Implement incrementally — happy path first, then edge cases
5. Write tests alongside implementation (not after)
6. Run quality checks: `npm run tsc && npm run eslint && npm run vitest`

---

## Feature Preservation

Never remove existing features, routes, or components without explicit
instruction. If a task might affect existing functionality, confirm before
proceeding.
