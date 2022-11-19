# Ansible UI Framework

[NPM Package: @ansible/ansible-ui-framework](https://www.npmjs.com/package/@ansible/ansible-ui-framework)

A framework for building responsive web applications using [PatternFly](https://www.patternfly.org).

Developed by the Ansible UI developers.

While PatternFly provides the building blocks and guidance on building applications, PatternFly does not manage state for the developer. This framework adds state management and abstractions for common patterns of application development.

The framework:

- does not use any state libraries other than the built in react context state management.
- does not assume any specific translation libraries, but does provide a hook for internal translations.
- does not assume any specific navigation libraries, but does provide a hook for internal navigation.

There is an [Ansible UI Framework Demo](https://github.com/jamestalton/ansible-ui-framework-demo) repo showing an example of using the framework.

## Getting Started

### Install the [NPM package](https://www.npmjs.com/package/@ansible/ansible-ui-framework)

```
npm install @ansible/ansible-ui-framework
```

### Add the [PageFramework](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageFramework.md#PageFramework) to your application

Near the top of your application add the [PageFramework](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageFramework.md#PageFramework) component. This component adds the state management needed by the framework components.

## Use the framework in your application pages

### Use PageLayout to control the layout in your pages

The [PageLayout](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageLayout.md#pagelayout) is used as the container for the contents of the page. It enables page components to leverage full page layout and scrolling of sub content. An example is a full page table that the page header, toolbar, column headers, and pagination stay fixed, but the rows of the table can scroll.

```tsx
<Page>
  <PageLayout>
    ...
  </PageLayout>
</Page>
```

### Use PageHeader for the heading of your pages

The [PageHeader](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageHeader.md#pageheader) is used at the top of each page. It provides a consistent layout of header elements.

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

For pages containing a table, use the [PageTable](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageTable.md#pagetable) component.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    <PageTable ... />
  </PageLayout>
</Page>
```

#### Form Pages

For pages containing an input form, use the [PageForm](https://github.com/ansible/ansible-ui/blob/main/framework/docs/PageForm.md#pageform) component.

```tsx
<Page>
  <PageLayout>
    <PageHeader ... />
    <PageForm ... />
  </PageLayout>
</Page>
```
