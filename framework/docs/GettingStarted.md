[Ansible UI Framework](Framework.md) ▸ [Guides](Guides.md) ▸ Getting Started

# Getting Started

While PatternFly provides the building blocks and guidance on building applications, PatternFly does not manage state for the developer. This framework adds state management and abstractions for common patterns of application development.

There is an [Ansible UI Framework Demo](https://github.com/jamestalton/ansible-ui-framework-demo) repo showing an example of using the framework.

## Install the NPM package

[NPM Package: @ansible/ansible-ui-framework](https://www.npmjs.com/package/@ansible/ansible-ui-framework)

```
npm install @ansible/ansible-ui-framework
```

## Add the [PageFramework](PageFramework.md) to your application

Near the top of your application add the [PageFramework](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageFramework.md) component.

This component adds the state management needed by the framework.

## Use the framework in your application pages

### Use PageLayout to control the layout in your pages

The [PageLayout](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageLayout.md) is used as the container for the contents of the page. It enables page components to leverage full page layout and scrolling of sub content. An example is a full page table that the page header, toolbar, column headers, and pagination stay fixed, but the rows of the table can scroll.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    ...
  </PageLayout>
</Page>
```

### Use PageHeader for the heading of your pages

The [PageHeader](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageHeader.md) is used at the top of each page. It provides a consistent layout of header elements.

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

For pages containing a table, use the [PageTable](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageTable.md) component.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    <PageTable ... />
  </PageLayout>
</Page>
```

#### Form Pages

For pages containing an input form, use the [PageForm](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageForm.md) component.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    <PageForm ... />
  </PageLayout>
</Page>
```

## Next Steps
