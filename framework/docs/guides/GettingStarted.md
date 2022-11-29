[Ansible UI Framework](../Framework.md) ▸ [Guides](../Guides.md) ▸ Getting Started

# Getting Started

## Install the NPM package

NPM Package: [@ansible/ansible-ui-framework](https://www.npmjs.com/package/@ansible/ansible-ui-framework)

```
npm install @ansible/ansible-ui-framework
```

## Add the PageFramework to your application

Near the top of your application add the [PageFramework](../componentsPageFramework.md) component.

This component adds the state management needed by the framework.

## Use the framework in your application pages

### Use PageLayout to control the layout in your pages

The [PageLayout](../components/PageLayout.md) is used as the container for the contents of the page. It enables page components to leverage full page layout and scrolling of sub content. An example is a full page table where the page header, toolbar, column headers, and pagination stay fixed, but the rows of the table can scroll.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    ...
  </PageLayout>
</Page>
```

### Use PageHeader for the heading of your pages

The [PageHeader](../componentsPageHeader.md) is used at the top of each page. It provides a consistent layout of header elements.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    ...
  </PageLayout>
</Page>
```

### Add content to the page

#### Table Pages

For pages containing a table, use the [PageTable](../componentsPageTable.md) component. The PageTable support table, list, and card views of the data.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    <PageTable ... />
  </PageLayout>
</Page>
```

<!-- #### Form Pages

For pages containing an input form, use the [PageForm](../componentsPageForm.md) component.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    <PageForm ... />
  </PageLayout>
</Page>
```

#### Detail Pages

TODO

#### Page sub navigation

TODO -->

### Other Useful Components

<!-- - [PageAlertToaster](../componentsPageAlertToaster.md) -->

- [BulkActionDialog](../componentsBulkActionDialog.md)
  <!-- - [BulkConfirmationDialog](../componentsBulkConfirmationDialog.md) -->
  <!-- - [SelectDialog](../componentsSelectDialog.md) -->
  <!-- - [SelectMultipleDialog](../componentsSelectMultipleDialog.md) -->
