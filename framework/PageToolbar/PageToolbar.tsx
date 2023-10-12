import {
  OnPerPageSelect,
  OnSetPage,
  ToolbarContent as PFToolbarContent,
  Pagination,
  PaginationVariant,
  Skeleton,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { Dispatch, Fragment, SetStateAction, useCallback } from 'react';
import styled from 'styled-components';
import { IPageAction, PageActionSelection } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { BulkSelector } from '../components/BulkSelector';
import { useBreakpoint } from '../components/useBreakPoint';
import { PageTableViewType } from './PageTableViewType';
import './PageToolbar.css';
import { IFilterState, IToolbarFilter, PageToolbarFilters } from './PageToolbarFilter';
import { PageTableSortOption, PageToolbarSort } from './PageToolbarSort';
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
  sortOptions?: PageTableSortOption[];
  /** Optional: Max selections permitted in a table. The bulk selector within the toolbar is disabled based on this value.
   */
  maxSelections?: number;

  toolbarContent?: React.ReactNode;
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
  } = props;

  const clearAllFilters = useCallback(() => {
    if (clearAllFiltersProp) {
      clearAllFiltersProp();
    } else if (setFilterState) {
      setFilterState({});
    }
  }, [setFilterState, clearAllFiltersProp]);

  const sm = useBreakpoint('md');

  const { viewType, setViewType } = props;
  let { toolbarActions } = props;
  toolbarActions = toolbarActions ?? [];

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
        style={{ paddingBottom: sm ? undefined : 8, paddingTop: sm ? undefined : 8 }}
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
    <Toolbar
      clearAllFilters={clearAllFilters}
      className="page-table-toolbar border-bottom"
      style={{ paddingBottom: sm ? undefined : 8, paddingTop: sm ? undefined : 8 }}
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
          {!props.disablePagination && (
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
                style={{ marginTop: -8, marginBottom: -8 }}
              />
            </ToolbarItem>
          )}
        </FlexGrowDiv>
      </ToolbarContent>
    </Toolbar>
  );
}
