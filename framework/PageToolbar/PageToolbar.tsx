import {
  PerPageOptions,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { Dispatch, Fragment, SetStateAction, useCallback, useState } from 'react';
import { IPageAction, PageActionSelection } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { BulkSelector } from '../components/BulkSelector';
import { useBreakpoint } from '../components/useBreakPoint';
import { PageTableViewType } from './PageTableViewType';
import { IFilterState, IToolbarFilter, PageToolbarFilters } from './PageToolbarFilter';
import { PageTableSortOption, PageToolbarSort } from './PageToolbarSort';
import { PageToolbarToggleGroupContext } from './PageToolbarToggleGroup';
import { PageToolbarView } from './PageToolbarView';

export type PageToolbarProps<T extends object> = {
  localStorageKey?: string;

  openColumnModal?: () => void;
  keyFn: (item: T) => string | number;

  itemCount?: number;

  toolbarActions?: IPageAction<T>[];

  toolbarFilters?: IToolbarFilter[];
  filterState?: IFilterState;
  setFilterState?: Dispatch<SetStateAction<IFilterState>>;
  clearAllFilters?: () => void;

  page?: number;
  perPage?: number;
  setPage?: (page: number) => void;
  setPerPage?: (perPage: number) => void;
  perPageOptions?: PerPageOptions[];

  isSelected?: (item: T) => boolean;
  selectedItems?: T[];
  selectItem?: (item: T) => void;
  unselectItem?: (item: T) => void;
  selectItems?: (items: T[]) => void;
  unselectAll?: () => void;
  onSelect?: (item: T) => void;
  showSelect?: boolean;

  sort?: string;
  setSort?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  setSortDirection?: (sortDirection: 'asc' | 'desc') => void;

  viewType?: PageTableViewType;
  setViewType?: (viewType: PageTableViewType) => void;

  disableTableView?: boolean;
  disableListView?: boolean;
  disableCardView?: boolean;
  disablePagination?: boolean;
  autoHidePagination?: boolean;
  sortOptions?: PageTableSortOption[];
  /** Optional: Max selections permitted in a table. The bulk selector within the toolbar is disabled based on this value.
   */
  maxSelections?: number;

  toolbarContent?: React.ReactNode;

  /**
   * Limits the filters so that only one filter can be set to an OR operation.
   *
   * Example: AWX can either have an OR on type or status but not both.
   * So once one has 2 selections, the other becomes a single select.
   */
  limitFiltersToOneOrOperation?: boolean;
};

export function PageToolbar<T extends object>(props: PageToolbarProps<T>) {
  const {
    itemCount,
    toolbarFilters,
    selectedItems,
    filterState,
    setFilterState,
    openColumnModal,
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    sortOptions,
    clearAllFilters: clearAllFiltersProp,
  } = props;

  const clearAllFilters = useCallback(() => {
    if (clearAllFiltersProp) {
      clearAllFiltersProp();
    } else if (setFilterState) {
      setFilterState({});
    }
  }, [setFilterState, clearAllFiltersProp]);

  const isMdOrLarger = useBreakpoint('md');

  const { viewType, setViewType } = props;
  let { toolbarActions } = props;
  toolbarActions = toolbarActions ?? [];

  const [activeGroup, setActiveGroup] = useState('');

  const showSearchAndFilters = toolbarFilters !== undefined;
  const showToolbarActions = toolbarActions !== undefined && toolbarActions.length > 0;

  const showSelect =
    props.showSelect === true ||
    (selectedItems !== undefined &&
      toolbarActions &&
      toolbarActions.find(
        (toolbarAction) =>
          'selection' in toolbarAction && toolbarAction.selection === PageActionSelection.Multiple
      ));

  const showToolbar = showSelect || showSearchAndFilters || showToolbarActions;
  if (!showToolbar) {
    return <Fragment />;
  }

  if (itemCount === undefined) {
    return (
      <Toolbar
        className="page-table-toolbar"
        style={{
          paddingBottom: isMdOrLarger ? undefined : 8,
          paddingTop: isMdOrLarger ? undefined : 8,
        }}
      >
        <ToolbarContent>
          <ToolbarItem style={{ width: '100%' }}>
            <Skeleton height="36px" />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    );
  }

  return (
    <PageToolbarToggleGroupContext.Provider value={{ activeGroup, setActiveGroup }}>
      <Toolbar
        ouiaId="page-toolbar"
        data-cy="page-toolbar"
        data-testid="page-toolbar"
        clearAllFilters={clearAllFilters}
        className="page-table-toolbar"
        style={{
          paddingBottom: isMdOrLarger ? undefined : 8,
          paddingTop: isMdOrLarger ? undefined : 8,
        }}
        inset={{
          default: 'insetMd',
          sm: 'insetMd',
          md: 'insetMd',
          lg: 'insetMd',
          xl: 'insetLg',
          '2xl': 'insetLg',
        }}
      >
        <ToolbarContent>
          {/* Selection */}
          {viewType !== 'table' && showSelect && (
            <ToolbarGroup>
              <ToolbarItem>
                <BulkSelector {...props} />
              </ToolbarItem>
            </ToolbarGroup>
          )}

          {/* Filters */}
          {filterState && setFilterState && (
            <PageToolbarFilters
              toolbarFilters={toolbarFilters}
              filterState={filterState}
              setFilterState={setFilterState}
              limitFiltersToOneOrOperation={props.limitFiltersToOneOrOperation}
            />
          )}

          {props.toolbarContent}

          {/* Actions */}
          <ToolbarGroup variant="action-group">
            <PageActions
              dropDownAriaLabel="toolbar actions"
              actions={toolbarActions}
              selectedItems={selectedItems}
              wrapper={ToolbarItem}
            />
          </ToolbarGroup>

          {/* Right aligned items */}
          <ToolbarGroup align={{ default: 'alignEnd' }}>
            {/* Sort */}
            {viewType !== 'table' && (
              <PageToolbarSort
                sort={sort}
                setSort={setSort}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                sortOptions={sortOptions}
              />
            )}

            {/* View */}
            {viewType && setViewType && (
              <PageToolbarView
                disableTableView={props.disableTableView}
                disableListView={props.disableListView}
                disableCardView={props.disableCardView}
                viewType={viewType}
                setViewType={setViewType}
                openColumnModal={openColumnModal}
              />
            )}
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    </PageToolbarToggleGroupContext.Provider>
  );
}
