The [PageTabs](./PageTabs) components is used for tabs when displaying multiple content components on a page.

```tsx
<PageLayout>
  <PageHeader ... />
  <PageTabs>
    <PageTab label="Page 1">
      ...
    </PageTab>
    <PageTab label="Page 2">
      ...
    </PageTab>
  </PageTabs>
</PageLayout>
```

| Prop  | Type     | Description
| ----- | -------- | -----------
| label | `string` | The label for the tab.