[Ansible UI Framework](Framework.md) ▸ [Components](Components.md) ▸ BulkActionDialog

# BulkActionDialog

BulkActionDialog is a generic dialog for process bulk actions.
It processes the actions in parallel up to 5 concurrently.
The easiest way to use the BulkActionDialog is then useBulkActionDialog hook.

| Param            | Type                | Description                                                               |
| ---------------- | ------------------- | ------------------------------------------------------------------------- |
| title            | `string`            | The title of the model.                                                   |
| items            | `T[]`               | The items to confirm for the bulk action.                                 |
| keyFn            | `function`          | A function that gets a unique key for each item.                          |
| actionColumns    | `ITableColumn<T>[]` | The columns to display when processing the actions.                       |
| actionFn         | `function`          | The action function to perform on each item                               |
| [onComplete]     | `function`          | Callback when all the actions are complete. Returns the successful items. |
| [onClose]        | `function`          | Callback called when the dialog closes.                                   |
| [processingText] | `string`            | The text to show for each item when the action is happening.              |
| [isDanger]       | `boolean`           | Indicates if this is a destructive operation.                             |

## useBulkActionDialog()

useBulkActionDialog - react hook to open a BulkActionDialog by calling the hook with BulkActionDialogProps
