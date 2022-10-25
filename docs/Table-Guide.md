# Guide to creating a page containing a table

Creating a page for a table involves:

- [Define an interface for the data](#define-an-interface-for-the-data)
- [Create page layout](#create-page-layout)
- [Add a table view](#add-a-table-view)
- [Define columns for the table](#define-columns-for-the-table)
- [Add a PageTable](#add-a-pagetable)
- [Add ToolbarFilters](#add-toolbarfilters)
- [Add ToolbarActions](#add-toolbaractions)
- [Add RowActions](#add-rowactions)

## Define an interface for the data

```ts
export interface IPerson {
  name: string
}
```

## Create page layout

The page layout enables the layout to be responsive - responding to different page sizes and adjusting padding and borders.

```tsx
export function Persons() {
  return (
    <PageLayout>
      <PageHeader title="Persons" />
      <PageBody>
        Table will go here
      </PageBody>
    </PageLayout>
  )
}
```

## Add a table view

Each table uses a view using a React hook. The view handles the state for the table. Sorting, filtering, pagination, etc...

```tsx
const view = useView()
```

For different backends, the view can be wrapped to make a specific view hook for the API.

```tsx
export function Persons() {
  const view = useMyApiView<IPerson>({ url: '/api/persons' })
  ...
}
```

## Define columns for the table

```tsx
export function Persons() {
  const view = useMyApiView<IPerson>({ url: '/api/persons' })
  const tableColumns = useMemo<ITableColumn<IPerson>[]>(
    () => [
      {
        header: 'Name',
        cell: (person) => <TextCell text={person.name} />,
        sort: 'name',
      },
    ],
    []
  )
  ...
}
```

## Add a PageTable

The PageTable component takes in the properties from the view and shows a table for the view using the columns.

```tsx
export function Persons() {
  const view = useMyApiView<IPerson>({ url: '/api/persons' })
  const tableColumns = useMemo<ITableColumn<IPerson>[]>(
    () => [
      {
        header: 'Name',
        cell: (person) => <TextCell text={person.name} />,
        sort: 'name',
      },
    ],
    []
  )
  return (
    <PageLayout>
      <PageHeader title="Persons" />
      <PageBody>
        <PageTable<IPerson> tableColumns={tableColumns} {...view} />
      </PageBody>
    </PageLayout>
  )
}
```

## Add ToolbarFilters

Filters are specified using IToolbarFilter. The key is used for url querystring persistence. The query is used by the view to make the API call with the filter.

```tsx
export function Persons() {
  const view = useMyApiView<IPerson>({ url: '/api/persons' })
  const tableColumns = ...
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        query: 'name',
      },
    ],
    []
  )
  return (
    <PageLayout>
      <PageHeader title="Persons" />
      <PageBody>
        <PageTable<IPerson>
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          {...view} />
      </PageBody>
    </PageLayout>
  )
}
```

## Add ToolbarActions

Toolbar actions are specified using ITypedAction.

```tsx
export function Persons() {
  const view = useMyApiView<IPerson>({ url: '/api/persons' })
  const tableColumns = ...
  const toolbarFilters = ...
  const toolbarActions = useMemo<ITypedAction<IPerson>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: 'Create person',
        onClick: () => alert("TODO"),
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: 'Deleted selected persons',
        onClick: (persons) => alert("TODO"),
      },
    ],
    []
  )
  return (
    <PageLayout>
      <PageHeader title="Persons" />
      <PageBody>
        <PageTable<IPerson>
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          toolbarActions={toolbarActions}
          {...view} />
      </PageBody>
    </PageLayout>
  )
}
```

## Add RowActions

Row actions are specified using ITypedAction.

```tsx
export function Persons() {
  const view = useMyApiView<IPerson>({ url: '/api/persons' })
  const tableColumns = ...
  const toolbarFilters = ...
  const toolbarActions = ...
  const rowActions = useMemo<IItemAction<Team>[]>(
    () => [
      {
        icon: EditIcon,
        label: 'Edit person',
        onClick: (person) => alert("TODO"),
      },
    ],
    [t]
  )
  return (
    <PageLayout>
      <PageHeader title="Persons" />
      <PageBody>
        <PageTable<IPerson>
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          toolbarActions={toolbarActions}
          rowActions={rowActions}
          {...view} />
      </PageBody>
    </PageLayout>
  )
}
```
