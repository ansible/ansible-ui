## PageToolbar
The PageToolbar contains pagination, sorting, filtering and view switch. It is usually not used directly but as a part of Page component.

```tsx
      <PageTableToolbar
        {...props}
        openColumnModal={openColumnModal}
        showSelect={showSelect}
        viewType={viewType}
        setViewType={setViewType}
        bottomBorder
        sortOptions={sortOptions}
      />
```
| Prop           | Type           | Description                       
| -------------- | -------------- | --------------------------------- 
|  openColumnModal?| () => void|
|  keyFn |(item: T) => string &verbar; number|
|  itemCount?| number| number of items when zero means there's no data
|  toolbarActions? | IPageAction<T>[]| array of all actions (see PageToolbarActions for more info) if empty actions will be hidden
|  toolbarFilters? | IToolbarFilter[]| array of all filters (see PageToolbarFilters for more info) if empty filters will be hidden
|  filters? | Record<string, string[]>| values of all set filters
|  setFilters ? | Dispatch<SetStateAction<Record<string, string[]>>>| function to add or remove a filter from set filters
|  clearAllFilters? | () => void| function to remove all filters set by an user to default value (doesn't have to mean no filters)
|  page | number| number of current page starting at 0
|  perPage | number| number of items per page
|  setPage | (page: number) => void| function to set current page
|  setPerPage | (perPage: number) => void| function to set number of items per page
|  isSelected? | (item: T) => boolean| function that
|  selectedItems? | T[]| array of selected items on the page
|  selectItem? | (item: T) => void| function to select an item
|  unselectItem? | (item: T) => void| function to remove an item from selected
|  selectItems? | (items: T[]) => void|
|  unselectAll?| () => void| function to remove all selected items from selected
|  onSelect? | (item: T) => void| function that is called when an item is selected
|  showSelect? | boolean| disables/enables controls related to the selection 
|  sort? | string| value of set sort
|  setSort? | (sort: string) => void| function to set sort
|  sortDirection? | 'asc' &verbar; 'desc'| value of sort direction 
|  setSortDirection?| (sortDirection: 'asc' &verbar; 'desc') => void| function to set sort direction
|  viewType | 'table' &verbar; 'list' &verbar; 'cards'| value of set view type
|  setViewType | (viewType: 'table' &verbar; 'list' &verbar; 'cards') => void| function to set view type
|  disableTableView? | boolean | disables table view control (if all three are disabled table view switch is hidden)
|  disableListView? | boolean | disables list view control (if all three are disabled table view switch is hidden)
|  disableCardView? | boolean | disable card view control (if all three are disabled table view switch is hidden)
|  disableColumnManagement ? | boolean| disable column management control
|  bottomBorder? | boolean| shows bottom border
|  sortOptions? | PageTableSortOption[]| (if there's no items sort will be hidden)

### PageToolbarFilters
```tsx
<PageToolbarFilters
          toolbarFilters={toolbarFilters}
          filters={filters}
          setFilters={setFilters}
        />
```
TODO
TODO - types of filters
### PageActions
```tsx
<PageActions
            actions={toolbarActions}
            selectedItems={selectedItems}
            wrapper={ToolbarItem}
          />
```
TODO
### PageToolbarSort
```tsx
<PageToolbarSort
            sort={sort}
            setSort={setSort}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            sortOptions={sortOptions}
          />
```
TODO
### PageToolbarView
```tsx
<PageToolbarView
            disableTableView={props.disableTableView}
            disableListView={props.disableListView}
            disableCardView={props.disableCardView}
            disableColumnManagement={props.disableColumnManagement}
            viewType={viewType}
            setViewType={setViewType}
            openColumnModal={openColumnModal}
          />
```
TODO
### Pagination
```tsx
<Pagination
            variant={PaginationVariant.top}
            isCompact
            itemCount={itemCount}
            perPage={perPage}
            page={page}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
            style={{ marginTop: -8, marginBottom: -8 }}
          />
```
TODO