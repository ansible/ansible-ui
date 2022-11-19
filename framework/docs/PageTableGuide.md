[Ansible UI Framework](Framework.md) ▸ [Guides](Guides.md) ▸ PageTable

# PageTable Guide

## View

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

## Table Columns

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

## Page Table

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

## Toolbar Filters

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

## Toolbar Actions

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

## Row Actions

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
