## ReorderItems

Component to reorder items in a table/list by dragging items to a desired position. Optionally allows selecting items from the list using checkboxes.

```tsx
<ReorderItems
  columns={ ... }
  items={ ... }
  keyFn={ ... }
  onChange={(reorderedItems, selectedItems) => {
    ... 
  }}
  isCompactBorderless
  hideColumnHeaders
  isSelectableWithCheckbox
  defaultSelection={ ... }
/>
```

| Prop | Type | Description
| ---  | --- | ---
| columns| [Columns](#columns) | The columns for the table specified by a header and cell.
| items | `T[]` where T is a generic type representing an object in the list | The items to be displayed in the list/table.
| keyFn | <code>(item: T) => string | number;</code> | A function that gets a unique key for an item.
| onChange | <code>(items: T[], selectedItems: T[]) => void;</code> | Callback function to retrieve items with the updated order and selected items from the list. `onChange` is triggered on any updates to the order of the table as well as any changes to the selected items.
| isCompactBorderless? | boolean | Setting to show the table with the `compact` variant and without borders for rows. This might be applicable in the case of a single column list. Defaults to `false`.
| hideColumnHeaders? | boolean | Setting to hide column headers. For instance, if the list is a single column list and does not require displaying a header for the column. Defaults to `false`.
| isSelectableWithCheckbox? | boolean | Setting to include a column of checkboxes to enable selection of rows in the list. Defaults to `false`.
| defaultSelection? | `T[]` where T is a generic type representing an object in the list | Initial selection of rows, if applicable.

## Columns

Type: 
```tsx
{
    header: string;
    cell: (item: T) => ReactNode | string;
}[];
```
> where T is a generic type representing an object in the list