The [PageHeader](https://github.com/ansible/ansible-ui/components/PageHeader.md) is used at the top of each page. It provides a consistent layout of header elements. PageHeader enables the responsive layout of the header.

```tsx
<PageLayout>
  <PageHeader
    breadcrumbs={[{ label: 'Home', to: '/home' }, { label: 'Page title' }]}
    title='Page title'
    description='Page description'
    headerActions={<TypedActions actions={actions} />}
  />
  ...
</PageLayout>
```

| Prop           | Type           | Description                       | Location
| -------------- | -------------- | --------------------------------- | ---
| navigation     | `ReactNode`    | Page sub-navigation.              | top
| breadcrumbs    | `Breadcrumb[]` | The breadcrumbs for the page.     | top left
| title          | `string`       | The title of the page.            | left
| titleHelpTitle | `string`       | The title of help popover.        |
| titleHelp      | `ReactNode`    | The content for the help popover. |
| description    | `string`       | The description of the page.      | bottom left
| controls       | `ReactNode`    | Support for extra page controls.  | top right
| headerActions  | `ReactNode`    | The actions for the page.         | bottom right
