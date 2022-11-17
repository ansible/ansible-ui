# Ansible UI Framework

A framework for building responsive web applications using [PatternFly](https://www.patternfly.org).

Developed by the Ansible UI developers.

While PatternFly provides the building blocks and guidance on building applications,
PatternFly does not manage state for the developer.

This framework adds state management and abstractions for common patterns of application development.

The framework:

- does not use any state libraries other than the built in react context state management.
- does not assume any specific translation libraries, but does provide a hook for internal translations.
- does not assume any specific navigation libraries, but does provide a hook for internal navigation.

There is an [Ansible UI Framework Demo](https://github.com/jamestalton/ansible-ui-framework-demo) repo showing an example of using the framework.

## Getting Started

### Install the NPM package

```
npm install @ansible/ansible-ui-framework
```

### Add PageFramework to your application

Near the top of your application add the `<PageFramework>` component.

The `PageFramework` component bundles up all the context providers in the Ansible UI framework in a convienent component for framework consumers. Examples of internal context providers are translations, navigation, settings, alerts, and dialogs.

```tsx
<PageFramework navigate={navigate}>...</PageFramework>
```

### Use PageLayout in your pages

The `PageLayout` is used at the start of each page. It provides a consistent layout of page elements. It enables responsive layout based on the size of the window.

```tsx
(
<Page>
  <PageLayout>
    <PageHeader {...}/>
    <PageBody> ... </PageBody>
  </PageLayout>
</Page>
)
```

### Use PageHeader at the top of your pages

The `PageHeader` is used at the top of each page. It provides a consistent layout of header elements. It supports responsive layout based on the size of the window.

```tsx
(
<Page>
  <PageLayout>
    <PageHeader
      breadcrumbs={breadcrumbs}
      title="Page title"
      titleHelp="Page title popover description."
      description="Page description"
      headerActions={actions}
    />
    ...
  </PageLayout>
</Page>
```

#### Adding a page with a table

The `PageTable` handles the logic for tables on a page. It supports responsive layout based on the size of the window.

```tsx
<PageTable<User>
  toolbarFilters={toolbarFilters}
  toolbarActions={toolbarActions}
  tableColumns={tableColumns}
  rowActions={rowActions}
  {...view}
/>
```

See the [Table Guide](./docs/tables.md) for details.
