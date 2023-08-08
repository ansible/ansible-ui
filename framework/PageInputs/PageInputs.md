# Page Inputs

## Base Select Components

The base components are wrappers over the PatternFly components with a goal to make the component interface simpler.

- [`PageSingleSelect`](./PageSingleSelect.tsx): A select dropdown component that supports single selection of options.
- [`PageMultiSelect`](./PageMultiSelect.tsx): A select dropdown component that supports multiple selection of options.

#### Examples

```tsx
const [selectedOrganization, setSelectedOrganization] = useState<Organization>()
const organizations = [] // Pass in array of organizations to use as options

<PageSingleSelect
  placeholder="Select organization"
  value={selectedOrganization}
  setValue={setSelectedOrganization}
  options={organizations.map(organization=>({
    key: organization.id,
    value: organization
    label: organization.name,
    description: organization.description
  }))}
/>
```

```tsx
const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>()
const organizations = [] // Pass in array of organizations to use as options

<PageMultiSelect
  placeholder="Select organizations"
  values={selectedOrganizations}
  setValues={setSelectedOrganizations}
  options={organizations.map(organization=>({
    key: organization.id,
    value: organization
    label: organization.name,
    description: organization.description
  }))}
/>
```

### Async Select Components

The async components are wrappers over the base select components with a goal of loading options asynchronously from APIs and supporting pagination of results.

- [`PageAsyncSingleSelect`](./PageAsyncSingleSelect.tsx) uses `PageSingleSelect`
- [`PageAsyncMultiSelect`](./PageAsyncMultiSelect.tsx) uses `PageMultiSelect`

### Form Select Components

The form components are wrappers of the base and async components with a goal of supporting forms and specifically `react-hook-form`.

- `PageFormSingleSelect` uses `PageSingleSelect`
- `PageFormMultiSelect` uses `PageMultiSelect`
- `PageFormAsyncSingleSelect` uses `PageAsyncSingleSelect`
- `PageFormAsyncMultiSelect` uses `PageAsyncMultiSelect`

### Toolbar Select Filters

The toolbar filters define interfaces for filtering. When those interfaces are rendered on a toolbar the components will use common components.

- `IToolbarSingleSelect` uses `PageSingleSelect`
- `IToolbarMultiSelect` uses `PageMultiSelect`
- `IToolbarAsyncSingleSelect` uses `PageAsyncSingleSelect`
- `IToolbarAsyncMultiSelect` uses `PageAsyncMultiSelect`
