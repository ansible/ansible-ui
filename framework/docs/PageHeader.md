# PageHeader

PageHeader enables the responsive layout of the header.

| Param          | Type           | Description                       |
| -------------- | -------------- | --------------------------------- |
| breadcrumbs    | `Breadcrumb[]` | The breadcrumbs for the page.     |
| title          | `string`       | The title of the page.            |
| titleHelpTitle | `string`       | The title of help popover.        |
| titleHelp      | `ReactNode`    | The content for the help popover. |
| description    | `string`       | The description of the page.      |
| controls       | `ReactNode`    | Support for extra page controls.  |
| headerActions  | `ReactNode`    | The actions for the page.         |

## Example

```tsx
<Page>
  <PageLayout>
    <PageHeader
      breadcrumbs={[{ label: 'Home', to: '/home' }, { label: 'Page title' }]}
      title='Page title'
      description='Page description'
      headerActions={<PageActions actions={actions} />}
    />
    <PageBody />...</PageBody>
  </PageLayout>
<Page>
```
