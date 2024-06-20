### Overview

|method|description|priority|
|-|-|-|
|use*View|hook for reloadable GET list requests|:top: use for list screens|
|useGet|hook for a reloadable GET request|:top: use for detail screens|
|use*Request|hooks providing bare request functions with error handling|use for one-time requests without reloads|
|requestGet, postRequest, requestDelete, patchRequest|bare request functions|:arrow_down: use in utility function without any react context|

### Methods

#### use\*Request, requestGet, postRequest, requestDelete, patchRequest

All of these just do a http request (using `ky`) with the right csrf token - for use in actions and other hooks.

They come in the bare function variant, and a `use*Request` variant which provides more error handling & hook logic.
For example, `useGetRequest` returns a function `(url, query?)`, callable either directly or by `useSWR`.

Prefer `use\*Request` over `requestGet`/`*Request` when possible, the exception being util functions with no access to any hook context.

#### useGet

`useGet` takes `(url, query?, refreshInterval?)` and returns `{ data, error, refresh, isLoading }` - using `useSWR`

use in detail screen

#### use\*View

use in list screens

```typescript
import { useHubView } from '../useHubView';
import { hubAPI, pulpIdKeyFn } from '../api';


  // const toolbarFilters = useApprovalFilters();
  // const tableColumns = useApprovalsColumns();

  const view = useHubView<Approval>({
    url: hubAPI`/_ui/v1/collection-versions/`,
    keyFn: pulpIdKeyFn, // how to tell items apart: id (idKeyFn), pulp_id (pulpIdKeyFn) , pulp_href (pulpHrefKeyFn), name (nameKeyFn)
    toolbarFilters,
    tableColumns,
    queryParams: { 'foo': 'bar' }, // extra params
  });

  // <PageTable {...view} />
```

```typescript
import { usePulpView } from '../usePulpView';
import { pulpAPI, pulpHrefKeyFn } from '../api';


  // const toolbarFilters = useTaskFilters();
  // const tableColumns = useTaskColumns();

  const view = usePulpView<Task>({
    url: pulpAPI`/tasks/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns
  });

  // <PageTable {...view} />
```

under the hood, these use [useSWR](https://swr.vercel.app/) (via `framework/useView`)
and the view returns:

```
// from useView
page, setPage, perPage, setPerPage,
sort, setSort, sortDirection, setSortDirection,
filters, setFilters, clearAllFilters,
// from useSelected
selectedItems, selectItem, unselectItem, isSelected,
selectItems, selectAll, unselectAll, allSelected,
keyFn, unselectItems,
// only in useHubView
unselectItemsAndRefresh,
// common
error
itemCount
pageItems
refresh
```

### Helpers

For API urls,
Controller uses bare strings, starting with `/api/v2/`,
EDA uses bare strings, starting with `/api/eda/`,
monorepo login uses `/api/login` and `/api/logout`,
while Hub needs configurable prefixes, thus:

#### `hubAPI`, `pulpAPI`

example: ``url: pulpAPI`/tasks/`,``

by default, `` pulpAPI`/tasks/` === hubAPI`/pulp/api/v3/tasks/` === `/api/automation-hub/pulp/api/v3/tasks/` ``,
but can be overridden by running `npm run hub -- --env hub_api_base_path='/api/galaxy'` (or any other base path starting with `/api/`)

Both `hubAPI` and `pulpAPI` also handle escaping, `` hubAPI`/_ui/v1/namespaces/${namespace.name}/` `` will `encodeURIComponent` all interpolations.