#### handling user actions

User actions are all the things you can do to the items displayed in the UI, such as create, edit, delete, sync, open a transmogrify modal...

These are available in the header of a detail screen, with individual list screen items, and in list toolbars.

![20230628183905](https://github.com/ansible/ansible-ui/assets/289743/3ac159da-7ff6-404e-a831-4bebe730f8d3)
![20230628183932](https://github.com/ansible/ansible-ui/assets/289743/193c5186-adb4-4d7e-b2f4-65bc24c7f2d2)
![20230628183949](https://github.com/ansible/ansible-ui/assets/289743/e3767968-88c3-4490-8ee6-1947ccef5eff)


There will be significant overlaps between the lists of actions available for each item,  
but also create is only available in the list toolbar,  
while edit is only available for individual items.


detail page:
```jsx
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';

  const pageActions = useHubNamespaceActions();

  return (
    <PageLayout>
      <PageHeader
        headerActions={
          <PageActions<HubNamespace>
            actions={pageActions}
```

list page:
```jsx
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';
import { useHubNamespaceToolbarActions } from './hooks/useHubNamespaceToolbarActions';

  const toolbarActions = useHubNamespaceToolbarActions();
  const rowActions = useHubNamespaceActions();

  return (
    <PageTable<HubNamespace>
      toolbarActions={toolbarActions}
      rowActions={rowActions}
```

`use*Actions` is a hook that returns the list of actions, with `icon`, `label`, and an `onClick` function that triggers the action, or a `href` to navigate to.
(see details in [useHubNamespaceActions](https://github.com/ansible/ansible-ui/blob/main/frontend/hub/namespaces/hooks/useHubNamespaceActions.tsx), [useHubNamespaceToolbarActions](https://github.com/ansible/ansible-ui/blob/main/frontend/hub/namespaces/hooks/useHubNamespaceToolbarActions.tsx))

The `onClick` function itself would typically come from another, action-specific hook, such as...

```jsx
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

  const deleteHubNamespaces = useDeleteHubNamespaces(() => null);

        label: t('Delete selected namesapces'),
        onClick: deleteHubNamespaces,
```

(see [useDeleteHubNamespaces](https://github.com/ansible/ansible-ui/blob/main/frontend/hub/namespaces/hooks/useDeleteHubNamespaces.tsx))

`selection: PageActionSelection.Single` vs `.Multiple` seems to affect whether onClick gets one item or multiple,
`isDanger` makes it red,
`type` allows for `PageActionType.Separator` and `PageActionType.Button` (any more?)
`isPinned` pulls it out of the kebab,

TODO: how to disabled/invisible action, possible, but find examples


#### bulk actions

Most actions can be run for 1 to N items, this is called bulk actions, and usually implemented by the tooling calling action `onClick` for each item in batches, and reporting results in the same tasks modal. (And available from list screen toolbar, when items are selected in the list.)

The hook calls `const bulkAction = useBulkConfirmation<Collection>();` for the delete confirmation modal.
Not sure but probably [BulkActionDialog](https://github.com/ansible/ansible-ui/wiki/BulkActionDialog) for other actions?

TODO: tasks modal (is that ^?).

All actions (except for navigation) now report their results in a tasks modal, this replaces any success/failure alerts.


#### icon conventions

icons seem to be used for most/all action buttons, TODO document the right icons

|action|icon|description|
|-|-|-|
|Create|`PlusIcon`||
|Edit|`EditIcon`||
|Delete|`TrashIcon`||

(all `import { PlusIcon } from '@patternfly/react-icons'`)