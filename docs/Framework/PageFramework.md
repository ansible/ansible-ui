The [PageFramework](./PageFramework) component bundles up all the context providers in the Ansible UI framework in a convenient component for framework consumers.

Examples of internal context providers are translations, navigation, settings, alerts, and dialogs.

The PageFramework component needs to be placed near the top of your application tree, before any framework components are used.

```tsx
<PageFramework navigate={navigate}>
  ...
</PageFramework>
```

TODO
- Document navigation hook
- Document translation hook