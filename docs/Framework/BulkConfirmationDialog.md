**BulkConfirmationDialog** is a component for presenting a confirmation dialog for processing bulk actions. 

| Param            | Type                | Description                                                               |
| ---------------- | ------------------- | ------------------------------------------------------------------------- |
| title            | `string`            | The title of the dialog.                                                   |
| prompt           | `string`            | An optional description that shows up directly under the title.           |
| alertPrompts     | `string[]`          | An optional array of strings containing alert prompts above the list of selections. Example: If certain selected rows are non-actionable then the `alertPrompts` can display the appropriate message(s) with the reasons.      |
| items            | `T[]`               | The items to confirm for the bulk action.                                 |
| isItemNonActionable | `(item: T) => string \| undefined` | An optional function that determines that whether an action cannot be performed on a selected item (so that this item can be identified in the confirmation dialog with an alert icon). It returns a tooltip that can be displayed as part of the alert icon on the non-actionable row. |
| keyFn            | `function`          | A function that gets a unique key for each item.                          |
| confirmationColumns    | `ITableColumn<T>[]` | The columns to display in the confirmation dialog.                       |
| onConfirm        | `() => void;`       | Callback called when the user confirms the action.                        |
| onClose        | `() => void;`       | Optional callback called when the dialog closes.                        |
| confirmText        | `string`       | The prompt to show for the user to confirm the bulk action. This string should represent the number of actionable rows from the total selection.                        |
| actionButtonText        | `string`       | The text for the button to perform the action. This string should represent the number of actionable rows from the total selection.                           |
| isDanger       | `boolean`           | Optional flag to indicate if this is a destructive operation.                             |

## Usage

The easiest way to use the **BulkConfirmationDialog** is with the **useBulkConfirmation** hook.

This hook can be used to present a 2-step UI, where in the first step the user reviews the selected items and then either confirms or cancels the bulk action. If they confirm the action, this brings up the **BulkActionDialog** where the bulk action is performed on the actionable selected items and the user may view the progress of the action and the responses as they come in.

## useBulkConfirmation hook

A React hook that returns a setter for configuring the properties for the bulk confirmation and associated bulk action dialogs.

### Disabling actions for certain rows

Some of the selected rows may not be actionable. For instance, if the user selects an entire page of roles in the Automation Hub Roles UI and then initiates a bulk deletion, they should only be able to delete the custom roles but not the built-in ones. The useBulkConfirmation hook accepts properties for identifying the non-actionable rows (`isItemNonActionable`) and indicating them using an alert icon with an appropriate tooltip. Additionally, consolidated alert prompts related to the non-actionable rows can be shown towards the top of the confirmation dialog using the `alertPrompts` property.

```tsx
const bulkConfirmationAndAction = useBulkConfirmation<X>();    // Where X represents the TS interface for a selected item in the list
bulkConfirmationAndAction(...) // Pass props for confirmation and bulk action
```

#### Properties for configuring the bulk confirmation/action dialog:

| Param            | Type                | Description                                                               |
| ---------------- | ------------------- | ------------------------------------------------------------------------- |
| title            | `string`            | The title of the dialog.                                                   |
| prompt           | `string`            | An optional description that shows up directly under the title.           |
| alertPrompts     | `string[]`          | An optional array of strings containing alert prompts above the list of selections. Example: If certain selected rows are non-actionable then the `alertPrompts` can display the appropriate message(s) with the reasons.      |
| items            | `T[]`               | The items to confirm for the bulk action.                                 |
| isItemNonActionable | `(item: T) => string \| undefined` | An optional function that determines that whether an action cannot be performed on a selected item (so that this item can be identified in the confirmation dialog with an alert icon). It returns a tooltip that can be displayed as part of the alert icon on the non-actionable row. |
| keyFn            | `function`          | A function that gets a unique key for each item.                          |
| confirmationColumns    | `ITableColumn<T>[]` | The columns to display in the confirmation step.                       |
| actionColumns    | `ITableColumn<T>[]` | The columns to display in the action step that comes up after confirmation.                       |
| actionFn    | `(item: T, signal: AbortSignal) => Promise<unknown>` |  The action function to perform on each actionable item.                       |
| confirmText        | `string`       | The prompt to show for the user to confirm the bulk action. This string should represent the number of actionable rows from the total selection.                        |
| actionButtonText        | `string`       | The text for the button to perform the action. This string should represent the number of actionable rows from the total selection.                           |
| processingText        | `string`       | The text that shows up above the progress bar in the bulk action dialog when the bulk action is in progress. Defaults to "Processing".                       |
| isDanger       | `boolean`           | Optional flag to indicate if this is a destructive operation.                             |
| onComplete       | `(successfulItems: T[]) => void`           | Optional callback called when all the actions are complete. Returns the successful items.                             |

**Example**

An example of the usage can be found here: [frontend/hub/access/roles/hooks/useDeleteRoles.tsx](https://github.com/ansible/ansible-ui/blob/main/frontend/hub/access/roles/hooks/useDeleteRoles.tsx)

### Bulk action confirmation:
<img width="918" alt="Screenshot 2023-12-04 at 8 52 49 AM" src="https://github.com/ansible/ansible-ui/assets/43621546/6798af81-18a5-41b1-8fdd-2cd6ec8e4208">

### Bulk action:
<img width="799" alt="image" src="https://github.com/ansible/ansible-ui/assets/43621546/763dc5e5-e359-42ae-b2c1-cbc04e9fd793">

