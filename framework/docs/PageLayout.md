[Ansible UI Framework](https://github.com/ansible/ansible-ui/blob/main/framework/README.md#ansible-ui-framework) ▸ [Components](https://github.com/ansible/ansible-ui/blob/main/framework/docs/components.md#Ansible-UI-Components) ▸ PageLayout

# PageLayout

The PageLayout is used as the container for the contents of the page.
It enables page components to leverage full page layout and scrolling of sub content.
An example is a full page table that the page header, toolbar, column headers, and pagination stay fixed, but the rows of the table can scroll.

## Example

```tsx
<Page>
  <PageLayout>
    <PageHeader />
    ...
  </PageLayout>
<Page>
```
