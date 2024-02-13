import {
  OnPerPageSelect,
  OnSetPage,
  ToolbarContent as PFToolbarContent,
  Pagination,
  PaginationVariant,
  PerPageOptions,
  Skeleton,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { Dispatch, Fragment, SetStateAction, useCallback, useState } from 'react';
import styled from 'styled-components';
import { IPageAction, PageActionSelection } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { BulkSelector } from '../components/BulkSelector';
import { useBreakpoint } from '../components/useBreakPoint';
import { PageTableViewType } from './PageTableViewType';
import './PageToolbar.css';
import { IFilterState, IToolbarFilter, PageToolbarFilters } from './PageToolbarFilter';
import { PageTableSortOption, PageToolbarSort } from './PageToolbarSort';
import { PageToolbarToggleGroupContext } from './PageToolbarToggleGroup';
import { PageToolbarView } from './PageToolbarView';

const FlexGrowDiv = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: end;
  flex-wrap: wrap;
`;

const ToolbarContent = styled(PFToolbarContent)`
  & > .pf-v5-c-toolbar__content-section {
    row-gap: 16px;
    justify-content: end;
  }
`;

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
    page,
    perPage,
    setPage,
    setPerPage,
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
    perPageOptions,
  } = props;

  const clearAllFilters = useCallback(() => {
    if (clearAllFiltersProp) {
      clearAllFiltersProp();
    } else if (setFilterState) {
      setFilterState({});
    }
  }, [setFilterState, clearAllFiltersProp]);

  const isMdOrLarger = useBreakpoint('md');
  const isXxlOrLarger = useBreakpoint('xxl');

  const { viewType, setViewType } = props;
  let { toolbarActions } = props;
  toolbarActions = toolbarActions ?? [];

  const [activeGroup, setActiveGroup] = useState('');

  const onSetPage = useCallback<OnSetPage>(
    (_event, page) => (setPage ? setPage(page) : null),
    [setPage]
  );
  const onPerPageSelect = useCallback<OnPerPageSelect>(
    (_event, perPage) => (setPerPage ? setPerPage(perPage) : null),
    [setPerPage]
  );

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
        className="page-table-toolbar border-bottom"
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
        clearAllFilters={clearAllFilters}
        className="page-table-toolbar border-bottom"
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
        <ToolbarContent style={{ paddingRight: isXxlOrLarger ? 12 : 4 }}>
          {/* Selection */}
          {showSelect && (
            <ToolbarGroup>
              <ToolbarItem variant="bulk-select">
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
          <ToolbarGroup variant="button-group">
            <PageActions
              actions={toolbarActions}
              selectedItems={selectedItems}
              wrapper={ToolbarItem}
            />
          </ToolbarGroup>

          {/* The flex below is needed to make the toolbar wrap elements properly */}
          <FlexGrowDiv>
            {/* Sort */}
            <PageToolbarSort
              sort={sort}
              setSort={setSort}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              sortOptions={sortOptions}
            />

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

            {/* Pagination */}
            {!props.disablePagination && !props.autoHidePagination && isXxlOrLarger && (
              <ToolbarItem
                visibility={{ default: 'hidden', '2xl': 'visible' }}
                style={{ marginLeft: 24, alignSelf: 'center' }}
              >
                <Pagination
                  variant={PaginationVariant.top}
                  isCompact
                  itemCount={itemCount}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  perPageOptions={perPageOptions}
                  style={{ marginTop: -8, marginBottom: -8 }}
                />
              </ToolbarItem>
            )}
          </FlexGrowDiv>
        </ToolbarContent>
      </Toolbar>
    </PageToolbarToggleGroupContext.Provider>
  );
}
