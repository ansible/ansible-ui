# Page Inputs

## Base Select Components

The base components are wrappers over the PatternFly components with a goal to make the component interface simpler.

- [`PageSingleSelect`](./PageSingleSelect.tsx): A select dropdown component that supports single selection of options.

  ```tsx
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>()
  const organizations = [] // Pass in array of organizations to use as options
  return <PageSingleSelect
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

- [`PageMultiSelect`](./PageMultiSelect.tsx): A select dropdown component that supports multiple selection of options.

  ```tsx
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>()
  const organizations = [] // Pass in array of organizations to use as options
  return <PageMultiSelect
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

  ```tsx
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>()
  const queryOrganizations = ( page:number ) => return Promise.resolve({
    total: 0, // return the total count from the async call
    options: [/* return an array of PageSelectOptions<Organization> */]
  ])
  return <PageAsyncSingleSelect
    placeholder="Select organization"
    value={selectedOrganization}
    setValue={setSelectedOrganization}
    queryOptions={queryOrganizations}
  />
  ```

- [`PageAsyncMultiSelect`](./PageAsyncMultiSelect.tsx) uses `PageMultiSelect`

  ```tsx
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>()
  const queryOrganizations = ( page:number ) => return Promise.resolve({
    total: 0, // return the total count from the async call
    options: [/* return an array of PageSelectOptions<Organization> */]
  ])
  return <PageMultiSelect
    placeholder="Select organizations"
    values={selectedOrganizations}
    setValues={setSelectedOrganizations}
    queryOptions={queryOrganizations}
  />
  ```

### Form Select Components

The form components are wrappers of the base and async components with a goal of supporting forms and specifically `react-hook-form`.

- `PageFormSingleSelect` uses `PageSingleSelect`
- `PageFormMultiSelect` uses `PageMultiSelect`
- `PageFormAsyncSingleSelect` uses `PageAsyncSingleSelect`
- `PageFormAsyncMultiSelect` uses `PageAsyncMultiSelect`

### Toolbar Select Filters

The toolbar filters define interfaces for filtering. When those interfaces are rendered on a toolbar the components will use common components.

- `IToolbarSingleSelectFilter` uses `PageSingleSelect`

  ```tsx
  const organizations = [] // Pass in array of organizations to use as options
  return {
    type: ToolbarFilterType.SingleSelect,
    key: 'organization',
    query: 'organization',
    label: t('Organization'),
    placeholder: t('Select organization')
    options: organizations.map((organization: Organization) => ({
      value: organization.toString(),
      label: organization.name,
    }) || [],
  }
  ```

- `IToolbarMultiSelectFilter` uses `PageMultiSelect`

  ```tsx
  const organizations = [] // Pass in array of organizations to use as options
  return {
    type: ToolbarFilterType.MultiSelect,
    key: 'organizations',
    query: 'organizations',
    label: t('Organizations'),
    placeholder: t('Select organizations')
    options: organizations.map((organization: Organization) => ({
      value: organization.id.toString(),
      label: organization.name,
    }) || [],
  }
  ```

- `IToolbarAsyncSingleSelect` uses `PageAsyncSingleSelect`
- `IToolbarAsyncMultiSelect` uses `PageAsyncMultiSelect`

### `PageFormSecret`

A component that conditionally renders a masked (password-type) input field based on the `shouldHideField` prop. If `shouldHideField` is `true`, a masked input with a "Clear" button is displayed. Otherwise, the children are rendered.

Usage:

```tsx
import { PageFormSecret } from './path-to-your-file';

function SomeComponent() {
  const handleClear = () => {
    console.log('Clear button clicked!');
  };

  return (
    <div>
      {/* Hidden input */}
      <PageFormSecret shouldHideField={true} onClear={handleClear}>
        {/* This will not be shown when shouldHideField is true */}
        <input type="text" placeholder="Enter something..." />
      </PageFormSecret>

      {/* Visible input */}
      <PageFormSecret shouldHideField={false} onClear={handleClear}>
        <input
          type="text"
          placeholder="Enter something..."
          label="Some Label"
          labelHelp="Some helpful text"
        />
      </PageFormSecret>
    </div>
  );
}
```
