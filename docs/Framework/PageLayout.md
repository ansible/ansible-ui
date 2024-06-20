The [PageLayout](./PageLayout) is used as the container for the contents of the page.
It enables page components to leverage full page layout and scrolling of content.
An example is a full page table where the page header, toolbar, column headers, and pagination stay fixed, but the rows of the table can scroll.

```tsx
<PageLayout>
  <PageHeader ... />
  ...
</PageLayout>
```
