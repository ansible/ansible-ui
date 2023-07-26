# Page Inputs

## Base Components

The base components are wrappers over the PatternFly components with a goal to make the component interface simpler.

- `PageSingleSelect`: A select dropdown component that supports single selection of options.
- `PageMultiSelect`: A select dropdown component that supports multiple selection of options.

## Async Components

The async components are wrappers over the base components with a goal of loading options asynchrously from APIs and supporting pagination of results.

- `PageAsyncSingleSelect` uses PageSingleSelect internally
- `PageAsyncMultiSelect` uses PageMultiSelect internally

## Form Components

The form components are wrappers of the base and async components with a goal of supporting forms and specifically `react-hook-form`.

- `PageFormSingleSelect` uses PageSingleSelect internally
- `PageFormMultiSelect` uses PageMultiSelect internally
- `PageFormAsyncSingleSelect` uses PageAsyncSingleSelect internally
- `PageFormAsyncMultiSelect` uses PageAsyncMultiSelect internally

## Toolbar Filters

The toolbar filters define interfaces for filtering. When those interfaces are rendered on a toolbar the components will use common components.

- `IToolbarSingleSelect` uses PageSingleSelect
- `IToolbarMultiSelect` uses PageMultiSelect
- `IToolbarAsyncSingleSelect` uses PageAsyncSingleSelect
- `IToolbarAsyncMultiSelect` uses PageAsyncMultiSelect
