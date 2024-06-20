The [PageDetails](./PageDetails) component is for displaying the details of an object.

```tsx
<PageLayout>
  <PageHeader ... />
  <PageDetails>
    <PageDetail label="Label 1">
      Some value
    </PageDetail>
    <PageDetail label="Label 2">
      Some value
    </PageDetail>
  <PageDetails>
</PageLayout>
```

If a PageDetails content is `null` or `undefined`, then the PageDetail will auto hide itself.