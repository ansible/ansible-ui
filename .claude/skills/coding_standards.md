# Coding Standards

Code patterns specific to this monorepo. Read this skill before writing or
modifying any component, form, page, hook, or utility.

---

## 1. API Path Helpers — Never Hardcode Paths

Each workspace has a tagged template helper. ESLint enforces this — hardcoded
API paths like `/api/v2/...` or `/api/eda/v1/...` are errors.

```typescript
// AWX — /api/v2/...
import { awxAPI } from '../../common/api/awx-utils';
awxAPI`/users/${id}/`               // → /api/v2/users/42/

// EDA — /api/eda/v1/...
import { edaAPI } from '../../common/eda-utils';
edaAPI`/activations/`               // → /api/eda/v1/activations/

// Hub — /api/galaxy/...
import { hubAPI } from '../../common/api/formatPath';
hubAPI`/v3/collections/`            // → /api/galaxy/v3/collections/

// Platform (Gateway) — /api/gateway/v1/...
import { gatewayAPI } from '../../utils/gateway-api-utils';
gatewayAPI`/authenticators/`        // → /api/gateway/v1/authenticators/
```

Source files:
- `frontend/awx/common/api/awx-utils.tsx`
- `frontend/eda/common/eda-utils.tsx`
- `frontend/hub/common/api/formatPath.tsx`
- `platform/utils/gateway-api-utils.tsx`

---

## 2. CRUD Request Hooks and Functions

Two layers exist — choose based on context:

### Hook-based (preferred for components — auto-invalidate cache)

```typescript
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { usePutRequest } from '@ansible/common-ui/crud/usePutRequest';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';

const postRequest = usePostRequest<RequestBody, ResponseBody>();
const putRequest = usePutRequest<RequestBody, ResponseBody>();
const patchRequest = usePatchRequest<RequestBody, ResponseBody>();
const deleteRequest = useDeleteRequest();

await postRequest(url, body);   // POST — auto-clears SWR cache for url
await putRequest(url, body);    // PUT — auto-clears cache
await patchRequest(url, body);  // PATCH — auto-clears cache
await deleteRequest(url);       // DELETE — auto-clears cache
```

### Function-based (for use outside components or in SWR fetchers)

```typescript
import { requestGet, postRequest, requestPatch, requestPut, requestDelete } from '@ansible/common-ui/crud/Data';

const data = await requestGet<User>(url, signal);
await postRequest<ResponseBody, RequestBody>(url, body, signal);
await requestPatch<ResponseBody, RequestBody>(url, body);
```

### Data Fetching with SWR

```typescript
import { requestGet, swrOptions, useFetcher } from '@ansible/common-ui/crud/Data';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';

// Option A: useSWR directly
const { data, error, isLoading } = useSWR<User>(awxAPI`/users/${id}/`, requestGet, swrOptions);

// Option B: useGet helper (wraps useSWR with query param support)
const { data, error, refresh, isLoading } = useGet<User>(awxAPI`/users/${id}/`);

// Option C: useGetItem (convenience for single items)
const { data: user } = useGetItem<User>(awxAPI`/users/`, id);
```

The global `SWRConfig` in `PageSettingsProvider` sets `dedupingInterval: 2000`.
Do not set dedupingInterval per-hook unless you have a specific reason to override
the global default.

### OPTIONS Endpoint

```typescript
import { useOptions } from '@ansible/common-ui/crud/useOptions';
const { data: options } = useOptions<OptionsResponse>(awxAPI`/credentials/`);
```

### Fetching All Pages

```typescript
import { useAwxGetAllPages } from '../../common/useAwxGetAllPages';
const { data: allCredentialTypes } = useAwxGetAllPages<CredentialType>(awxAPI`/credential_types/`);
```

### Cache Invalidation

```typescript
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';

const { clearCacheByKey, clearAllCache } = useClearCache();
clearCacheByKey(awxAPI`/users/`);  // Smart: clears all SWR keys containing this URL base
```

Source: `frontend/common/crud/`

---

## 3. Workspace PageForm Wrappers

Never use the raw `PageForm` from the framework. Each workspace wraps it with
its error adapter:

| Workspace    | Wrapper              | Error Adapter        | Source                                    |
| ------------ | -------------------- | -------------------- | ----------------------------------------- |
| **AWX**      | `AwxPageForm`        | `awxErrorAdapter`    | `frontend/awx/common/AwxPageForm.tsx`     |
| **EDA**      | `EdaPageForm`        | `edaErrorAdapter`    | `frontend/eda/common/EdaPageForm.tsx`     |
| **Hub**      | `HubPageForm`        | `hubErrorAdapter`    | `frontend/hub/common/HubPageForm.tsx`     |
| **Platform** | `PlatformPageForm`   | `awxErrorAdapter`*   | `platform/common/PlatformPageForm.tsx`    |

*Platform defaults to AWX's error adapter but accepts an override prop.

```typescript
import { AwxPageForm } from '../../common/AwxPageForm';

<AwxPageForm<IFormData>
  submitText={t('Save')}
  onSubmit={onSubmit}
  onCancel={onCancel}
  defaultValue={initialData}
>
  <UserInputs mode="create" />
</AwxPageForm>
```

---

## 4. Error Adapters — Per-Workspace API Error Formats

Each workspace API returns errors in different formats. The error adapters
normalize them to `{ genericErrors[], fieldErrors[] }`.

| Workspace | Error formats handled                                                      |
| --------- | -------------------------------------------------------------------------- |
| **AWX**   | `detail`, `__all__`, `inputs` (credentials), `module_args`, `error`, field-by-field |
| **EDA**   | `detail` (string/array), `non_field_errors`, field-by-field               |
| **Hub**   | Galaxy format (`{ errors: [{ code, detail, source }] }`), Pulp format (field objects), 500 strings |

Each also exports a message parser hook:
- `useAwxErrorMessageParser()` — from `frontend/awx/common/adapters/awxErrorAdapter.tsx`
- `useEdaErrorMessageParser()` — from `frontend/eda/common/edaErrorAdapter.tsx`
- `useHubErrorMessageParser()` — from `frontend/hub/common/adapters/hubErrorAdapter.tsx`

Use these parsers when displaying errors outside of PageForm (e.g., toast alerts).

---

## 5. Form Input Components

Use the framework's PageForm inputs from `framework/PageForm/Inputs/`:

| Component                     | Use for                                   |
| ----------------------------- | ----------------------------------------- |
| `PageFormTextInput`           | Text, email, password, number fields      |
| `PageFormTextArea`            | Multiline text                            |
| `PageFormSelect`              | Static dropdown                           |
| `PageFormSingleSelect`        | Single-select with search                 |
| `PageFormMultiSelect`         | Multi-select dropdown                     |
| `PageFormAsyncSingleSelect`   | Async-loading single select (API-backed)  |
| `PageFormAsyncMultiSelect`    | Async-loading multi select (API-backed)   |
| `PageFormCreatableSelect`     | User can type new options                 |
| `PageFormCheckbox`            | Boolean toggle (checkbox)                 |
| `PageFormSwitch`              | Boolean toggle (switch)                   |
| `PageFormDataEditor`          | JSON/YAML code editor (Monaco)            |
| `PageFormSecret`              | Password with show/hide toggle            |
| `PageFormDateTimePicker`      | Date and time picker                      |
| `PageFormFileUpload`          | File upload                               |
| `PageFormSlider`              | Numeric slider                            |
| `PageFormToggleGroup`         | Toggle button group                       |
| `PageFormMarkdown`            | Markdown editor                           |
| `PageFormMultiInput`          | Multi-value text input                    |

Workspace-specific resource selectors also exist:
- `PageFormSingleSelectAwxResource` / `PageFormMultiSelectAwxResource`
- `PageFormSingleSelectEdaResource` / `PageFormMultiSelectEdaResource`
- `PageFormSelectOrganization`, `PageFormLabelSelect`, etc.

---

## 6. Create/Edit Form Pattern

Create and Edit forms follow a consistent pattern with separate functions:

```typescript
export function CreateUser() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<AwxUser, AwxUser>();

  const onSubmit: PageFormSubmitHandler<IUserInput> = async (userInput, setError, setFieldError) => {
    const { confirmPassword, ...user } = userInput;
    user.is_superuser = userInput.userType === UserType.SystemAdministrator;
    if (confirmPassword !== user.password) {
      setFieldError('confirmPassword', { message: t('Password does not match.') });
      return false;
    }
    const newUser = await postRequest(awxAPI`/organizations/${user.organization!.toString()}/users/`, user);
    pageNavigate(AwxRoute.UserDetails, { params: { id: newUser.id } });
  };

  return (
    <PageLayout>
      <PageHeader title={t('Create user')} breadcrumbs={[...]} />
      <AwxPageForm submitText={t('Create user')} onSubmit={onSubmit} onCancel={() => navigate(-1)}>
        <UserInputs mode="create" />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditUser() {
  const params = useParams<{ id: string }>();
  const { data: user } = useSWR<AwxUser>(awxAPI`/users/${params.id ?? ''}/`, requestGet, swrOptions);
  // Similar structure — uses requestPatch instead of postRequest
}
```

Key points:
- `PageFormSubmitHandler<T>` receives `(data, setError, setFieldError)`
- Form data type may include extra fields not in the API type
  (e.g., `confirmPassword`, `userType`)
- Use `usePageNavigate` with route enums for success navigation
- Shared inputs extracted as a component (e.g., `<UserInputs mode="create" />`)
- Return `false` from `onSubmit` to prevent form closing (validation errors)

Source: `frontend/awx/access/users/UserForm.tsx`

---

## 7. List View Hooks — Per-Workspace

Each workspace has its own view hook. They differ in type constraints and
response format handling.

| Workspace | Hook               | Type constraint           | Response format                                   |
| --------- | ------------------ | ------------------------- | ------------------------------------------------- |
| **AWX**   | `useAwxView<T>`    | `T extends { id: number }`| `{ count, results, next, previous }`              |
| **EDA**   | `useEdaView<T>`    | `T extends { id: number \| string }` | `{ count, results }`               |
| **Hub**   | `useHubView<T>`    | `T extends object` (requires `keyFn`) | Galaxy: `{ meta: { count }, data, links }` or Pulp: `{ count, results }` |

```typescript
// AWX
const view = useAwxView<Credential>({
  url: awxAPI`/credentials/`,
  toolbarFilters,
  tableColumns,
  queryParams,
  disableQueryString,  // Use in modals/details
});

// EDA
const view = useEdaView<EdaRulebookActivation>({
  url: edaAPI`/activations/`,
  toolbarFilters,
  tableColumns,
});

// Hub (note: keyFn is required)
const view = useHubView<HubNamespace>({
  url: hubAPI`/v3/namespaces/`,
  toolbarFilters,
  tableColumns,
  keyFn: (item) => item.name,  // Required for Hub
});
```

All return: `pageItems`, `itemCount`, `error`, `refresh()`, `updateItem()`,
plus pagination, sorting, filtering, and selection state.

Source files:
- `frontend/awx/common/useAwxView.tsx`
- `frontend/eda/common/useEventDrivenView.tsx`
- `frontend/hub/common/useHubView.tsx`

---

## 8. List Page Composition Pattern

List pages decompose into composable hooks:

```typescript
export function CredentialsList() {
  const toolbarFilters = useCredentialsFilters();      // IToolbarFilter[]
  const tableColumns = useCredentialsColumns();        // ITableColumn<T>[]
  const rowActions = useCredentialActions();            // IPageAction<T>[]
  const toolbarActions = useCredentialToolbarActions(); // IPageAction<T>[]

  const view = useAwxView<Credential>({
    url: awxAPI`/credentials/`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <PageTable<Credential>
      {...view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
    />
  );
}
```

### Columns — `ITableColumn<T>[]`

```typescript
const tableColumns: ITableColumn<Credential>[] = [
  { header: t('Name'), cell: (item) => item.name, sort: 'name', defaultSort: true },
  { header: t('Type'), cell: (item) => credTypeMap[item.credential_type] },
];
```

Composable column hooks exist: `useNameColumn`, `useIdColumn`,
`useDescriptionColumn`, `useLastRanColumn` — from `frontend/common/columns.tsx`.

Column display options per view type: `table`, `list`, `card`, `modal`,
`dashboard` — each with `ColumnTableOption`, `ColumnListOption`, etc.

### Actions — `IPageAction<T>[]`

```typescript
const rowActions: IPageAction<Credential>[] = [
  {
    type: PageActionType.Button,
    selection: PageActionSelection.Single,
    icon: EditIcon,
    label: t('Edit'),
    onClick: (item) => pageNavigate(AwxRoute.EditCredential, { params: { id: item.id } }),
    isPinned: true,
    isDisabled: (item) => cannotEditResource(item, t),
  },
  {
    type: PageActionType.Button,
    selection: PageActionSelection.Multiple,
    icon: TrashIcon,
    label: t('Delete'),
    onClick: (items) => deleteCredentials(items),
    isDanger: true,
  },
];
```

Action types: `Button`, `Link`, `Switch`, `Dropdown`, `Separator`.
Selection modes: `None`, `Single`, `Multiple`.

---

## 9. RBAC Helpers

Access control predicates from `frontend/common/utils/RBAChelpers.ts`:

```typescript
import { cannotEditResource, cannotDeleteResource, cannotCopyResource } from '@ansible/common-ui/utils/RBAChelpers';

// Returns error string if forbidden, empty string if allowed
const disabledReason = cannotEditResource(resource, t);
const deleteReason = cannotDeleteResource(resource, t);
const copyReason = cannotCopyResource(resource, t);

// Use in action definitions
isDisabled: (item) => cannotDeleteResource(item, t),
```

These check `resource.summary_fields.user_capabilities.edit/delete/copy`.

---

## 10. Framework Component Inventory

The framework exports 79+ components. Before creating anything new, check here:

### Page Structure
`PageLayout`, `PageBody`, `PageHeader`, `PageMasthead`, `PageNavigation`,
`PageApp`, `PageFramework`, `PageTabs`, `PageTitle`

### Data Display
`PageTable`, `PageDetails`, `PageDetailsFromColumns`, `PageDashboard`,
`PageDashboardCard`, `PageDashboardChart`, `PageDashboardCount`

### Forms
`PageForm`, `GenericForm`, `PageFormCheckbox`, `PageFormSelect`,
`PageFormSwitch`, `PageFormTextArea`, `PageFormTextInput`,
`PageFormDataEditor`, `PageFormAsyncSingleSelect`, `PageFormAsyncMultiSelect`

### Dialogs
`PageDialog`, `BulkActionDialog`, `BulkConfirmationDialog`,
`MultiSelectDialog`, `useSelectDialog`

### Wizards
`PageWizard`, `PageWizardStep`, `usePageWizard()`

### Actions
`PageAction`, `PageActions` (with `PageActionType` and `PageActionSelection`)

### Toolbar & Filtering
`PageToolbar`, `ToolbarTextFilter`, `ToolbarSingleSelectFilter`,
`ToolbarMultiSelectFilter`, `ToolbarAsyncSingleSelectFilter`,
`ToolbarAsyncMultiSelectFilter`, `ToolbarDateRangeFilter`

### Empty States
`PageNotFound`, `PageNotImplemented`, `EmptyStateError`, `EmptyStateNoData`,
`EmptyStateFilter`, `EmptyStateUnauthorized`

### Notifications
`PageAlertToaster`, `usePageAlertToaster()`, `PageNotificationsIcon`

### Cell Renderers
`TextCell`, `DateTimeCell`, `BytesCell`, `ElapsedTimeCell`, `LabelsCell`,
`CopyCell`

### Hooks
`useView`, `useInMemoryView`, `usePageSettings`, `usePageNavigate`,
`useGetPageUrl`, `usePageDialogs`, `usePageAlertToaster`, `useBreakPoint`,
`useID`, `useClipboard`, `useAbortController`

### Utilities
`LoadingPage`, `Scrollable`, `ErrorBoundary`, `Collapse`, `Help`,
`StandardPopover`, `BulkSelector`, `RunningIcon`, `pfcolors`

Source: `framework/index.ts`

---

## 11. Routing

Use `usePageNavigate` with workspace route enums:

```typescript
import { usePageNavigate, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '../../main/AwxRoutes';

// Navigate
const pageNavigate = usePageNavigate();
pageNavigate(AwxRoute.UserDetails, { params: { id: user.id } });

// Build URL (for breadcrumbs, links)
const getPageUrl = useGetPageUrl();
const url = getPageUrl(AwxRoute.Users);
```

Route enum naming convention: `WorkspaceRoute.ResourceAction`
- `AwxRoute.Users`, `AwxRoute.CreateUser`, `AwxRoute.EditUser`, `AwxRoute.UserDetails`
- `EdaRoute.RulebookActivations`, `EdaRoute.CreateRulebookActivation`
- Route enum values use kebab-case: `'awx-users'`, `'eda-rulebook-activations'`

Source: `frontend/awx/main/AwxRoutes.tsx`, `frontend/eda/main/EdaRoutes.tsx`

---

## 12. Common Utilities

### Shared Columns (`frontend/common/columns.tsx`)
`useIdColumn<T>()`, `useNameColumn<T>()`, `useDescriptionColumn<T>()`,
`useLastRanColumn()`

### Key Functions (`frontend/common/utils/nameKeyFn.tsx`)
`nameKeyFn(item)` — returns `item.name`
`idKeyFn(item)` — returns `item.id`

### Polling (`frontend/common/poll.ts`)
`poll<T>(fn, check, interval?, maxAttempts?)` — poll until condition met

### Virtual Scrolling (`frontend/common/utils/useVirtualized.tsx`)
`useVirtualizedList<T>(containerRef, items)` — virtual list rendering

### URL Validation (`frontend/common/validation/useIsValidUrl.tsx`)
`useIsValidUrl()` — returns validator for HTTP/HTTPS URLs

### String Utilities (`frontend/awx/common/util/strings.ts`)
`toTitleCase()`, `truncateString()`, `stringIsUUID()`, `arrayToString()`,
`stringToArray()`

### Hub Task Polling (`frontend/hub/common/api/hub-api-utils.tsx`)
`waitForTask(taskHref, signal, minDelay, multiplier, retries)` — exponential
backoff for async Hub operations (returns 202 with task reference)

### Request Error (`frontend/common/crud/RequestError.ts`)
`RequestError` class with `statusCode`, `body`, `json`, `details`
`createRequestError(response)` — factory from HTTP response
`isRequestError(error)` — type guard

---

## 13. Active User and Config Hooks

```typescript
// AWX
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxConfig } from '../../common/useAwxConfig';
const activeUser = useAwxActiveUser();
const config = useAwxConfig();

// EDA
import { useEdaActiveUser } from '../../common/useEdaActiveUser';
import { useEdaConfig } from '../../common/useEdaConfig';

// Feature Flags (AWX)
import { useFeatureFlag } from '../../common/useFeatureFlags';
const isEnabled = useFeatureFlag('FEATURE_NAME');
```

---

## 14. Bulk Operations

Use framework dialog utilities for bulk actions:

```typescript
import { useAwxBulkActionDialog } from '../../common/useAwxBulkActionDialog';
import { useAwxBulkConfirmation } from '../../common/useAwxBulkConfirmation';

// Bulk action with progress (uses AWX error adapter)
const bulkAction = useAwxBulkActionDialog<Credential>();

// Bulk confirmation before destructive actions
const confirm = useAwxBulkConfirmation<Credential>();
```

EDA equivalents: `useEdaBulkActionDialog`, `useEdaBulkConfirmation`.

---

## 15. ESLint Rules to Know

Key enforced rules from `.eslintrc.json`:

- **`eqeqeq: "error"`** — strict equality (`===`) always
- **`no-console: "error"`** — no `console.log` in production code
- **`no-only-tests: "error"`** — no `test.only()` committed
- **`no-restricted-exports`** — no default exports
- **`i18next/no-literal-string`** — JSX text and attributes must use `t()`
- **`jsx-a11y/recommended`** — accessibility rules enforced
- **`react-hooks/recommended`** — hook rules (deps arrays, ordering)
- **Hardcoded API paths forbidden** — custom ESLint rule blocks `/api/v2/`,
  `/api/eda/v1/`, `/api/gateway/v1/`, `/api/galaxy/` literals

---

## 16. Internationalization

- Wrap all user-facing strings: `t('Label text')` via `useTranslation`
- **Never** compare translated strings in logic — compare raw API values
  (`resource.status === 'active'`), enums, routes, or other non-translated IDs
- Translate only for display: `<Label>{t(resource.status)}</Label>`
- Run `npm run i18n` after adding new strings
- ESLint enforces `i18next/no-literal-string` on JSX attributes

---

## 17. Component Props

Mark all component props as `Readonly`:

```typescript
export function MyComponent(props: Readonly<MyComponentProps>) { ... }
```

This is enforced by SonarCloud rule S6759.

## 18. File naming

- Test files: `*.spec.ts` (Playwright) or `*.test.ts` / `*.test.tsx` (Vitest)
- Component files: PascalCase (e.g. `UserTable.tsx`)
- Utility files: camelCase (e.g. `apiHelpers.ts`)
- Constants: UPPER_SNAKE_CASE

