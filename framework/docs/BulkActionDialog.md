# BulkActionDialog

BulkActionDialog

| Param            | Type                     | Description                                                               |
| ---------------- | ------------------------ | ------------------------------------------------------------------------- |
| title            | `string`                 | The title of the model.                                                   |
| items            | `Array(T)`               | The items to confirm for the bulk action.                                 |
| keyFn            | `function`               | A function that gets a unique key for each item.                          |
| actionColumns    | `Array(ITableColumn<T>)` | The columns to display when processing the actions.                       |
| actionFn         | `function`               | The action function to perform on each item                               |
| [onComplete]     | `function`               | Callback when all the actions are complete. Returns the successful items. |
| [onClose]        | `function`               | Callback called when the dialog closes.                                   |
| [processingText] | `string`                 | The text to show for each item when the action is happening.              |
| [isDanger]       | `boolean`                | Indicates if this is a destructive operation.                             |
