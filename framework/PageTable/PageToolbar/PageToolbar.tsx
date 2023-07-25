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
import { Dispatch, Fragment, SetStateAction, useCallback } from 'react';
import styled from 'styled-components';
import { IPageAction, PageActionSelection } from '../../PageActions/PageAction';
import { PageActions } from '../../PageActions/PageActions';
import { BulkSelector } from '../../components/BulkSelector';
import { useBreakpoint } from '../../components/useBreakPoint';
import { PageTableViewType } from './PageTableViewType';
import './PageToolbar.css';
import { IToolbarFilter, PageToolbarFilters } from './PageToolbarFilter';
import { PageTableSortOption, PageToolbarSort } from './PageToolbarSort';
import { PageToolbarView } from './PageToolbarView';

const FlexGrowDiv = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: end;
  flex-wrap: wrap;
`;

const ToolbarContent = styled(PFToolbarContent)`
  & > .pf-c-toolbar__content-section {
    row-gap: 16px;
    justify-content: end;
  }
`;

export type PageTableToolbarProps<T extends object> = {
  openColumnModal?: () => void;
  keyFn: (item: T) => string | number;

  itemCount?: number;

  toolbarActions?: IPageAction<T>[];

  toolbarFilters?: IToolbarFilter[];
  filters?: Record<string, string[]>;
  setFilters?: Dispatch<SetStateAction<Record<string, string[]>>>;
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
  disableColumnManagement?: boolean;
  disablePagination?: boolean;
  bottomBorder?: boolean;
  sortOptions?: PageTableSortOption[];
};

export function PageTableToolbar<T extends object>(props: PageTableToolbarProps<T>) {
  const {
    itemCount,
    page,
    perPage,
    setPage,
    setPerPage,
    toolbarFilters,
    selectedItems,
    filters,
    setFilters,
    clearAllFilters,
    openColumnModal,
    bottomBorder,
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    sortOptions,
  } = props;

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
        className="border-bottom dark-2"
        style={{ paddingBottom: sm ? undefined : 8, paddingTop: sm ? undefined : 8, zIndex: 400 }}
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
      className="dark-2 page-table-toolbar"
      style={{
        paddingBottom: sm ? undefined : 8,
        paddingTop: sm ? undefined : 8,
        borderBottom: bottomBorder ? 'thin solid var(--pf-global--BorderColor--100)' : undefined,
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
        {showSelect && (
          <ToolbarGroup>
            <ToolbarItem variant="bulk-select">
              <BulkSelector {...props} />
            </ToolbarItem>
          </ToolbarGroup>
        )}

        {/* Filters */}
        {filters && (
          <PageToolbarFilters
            toolbarFilters={toolbarFilters}
            filterState={filters}
            setFilterState={setFilters}
          />
        )}

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
              disableColumnManagement={props.disableColumnManagement}
              viewType={viewType}
              setViewType={setViewType}
              openColumnModal={openColumnModal}
            />
          )}

          {/* Pagination */}
          {!props.disablePagination && (
            <ToolbarItem
              visibility={{ default: 'hidden', '2xl': 'visible' }}
              style={{ marginLeft: 24 }}
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
