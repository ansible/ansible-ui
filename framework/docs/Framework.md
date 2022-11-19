[`Ansible UI Framework`](https://github.com/ansible/ansible-ui/blob/main/framework/README.md) ▸ [PageTable](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageTable.md#PageTable)

# Ansible UI Framework

A framework for creating performant, consistent, and responsive web applications using [PatternFly](https://www.patternfly.org).

The framework is made up of high level components using PatternFly components underneath.
This allows the framework to adjust the web application for responsive layout.
Basic structure of the framework can be seen in the tree below.

- [PageLayout](#pagelayout)
  - [PageHeader](#pageheader)
  - [PageBody](#pagebody)
    - [PageTable](#pagetable)
    - [PageTabs](#pagetabs)
    - [PageForm](#pageform)

## PageLayout

The PageLayout is used at the start of each page. It provides a consistent layout of header elements. It supports responsive layout based on the size of the window.

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

### PageHeader

The PageHeader is used at the start of each page. It provides a consistent layout of header elements. It supports responsive layout based on the size of the window.

```tsx
<Page>
  <PageHeader
    breadcrumbs={breadcrumbs}
    title="Page title"
    titleHelp="Page title popover description."
    description="Page description"
    headerActions={actions}
  />
</Page>
```

|       Property | Description                                                                |
| -------------: | -------------------------------------------------------------------------- |
|    breadcrumbs | The breadcrumbs for the page.                                              |
|          title | The title of the page.                                                     |
|      titleHelp | The help for the title popover.                                            |
| titleHelpTitle | The title of help popover.                                                 |
|    description | The description of the page.                                               |
|        actions | The actions for the page. Actions are used on details pages.               |
|       controls | Support for extra page controls that show up at the top right of the page. |

### PageBody

The page table handles the responsive layout of the body section of the page.

#### PageTable

The page table handles the logic for tables on a page.

```tsx
<PageTable<User>
  toolbarFilters={toolbarFilters}
  toolbarActions={toolbarActions}
  tableColumns={tableColumns}
  rowActions={rowActions}
  {...view}
/>
```

#### PageTabs

The page tabs are used for details pages in the application.

```tsx
(
<Page>
  <PageHeader ... />
  <PageTabs >
    <PageTab title="Tab title" >
      ...
    </PageTab>
    <PageTab title="Tab title" >
      ...
    </PageTab>
  </PageTabs>
</Page>
)
```

#### PageForm

The page form handles form input on a page. It uses [react-hook-form](https://react-hook-form.com/) for performance.
