import {
  Button,
  Flex,
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PaginationVariant,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ColumnsIcon, ListIcon, TableIcon, ThLargeIcon } from '@patternfly/react-icons';
import { Dispatch, Fragment, SetStateAction, useCallback } from 'react';
import styled from 'styled-components';
import { IPageAction, PageActionSelection } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { BulkSelector } from '../components/BulkSelector';
import { useBreakpoint } from '../components/useBreakPoint';
import { PageTableViewType, PageTableViewTypeE } from './PageTableViewType';
import './PageToolbar.css';
import { IToolbarFilter, PageTableToolbarFilters } from './PageToolbarFilter';
import { PageTableSortOption, PageTableToolbarSort } from './PageToolbarSort';

const FlexGrowDiv = styled.div`
  flex-grow: 1;
`;

export type PagetableToolbarProps<T extends object> = {
  openColumnModal?: () => void;
  keyFn: (item: T) => string | number;

  itemCount?: number;

  toolbarActions?: IPageAction<T>[];

  toolbarFilters?: IToolbarFilter[];
  filters?: Record<string, string[]>;
  setFilters?: Dispatch<SetStateAction<Record<string, string[]>>>;
  clearAllFilters?: () => void;

  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

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

  viewType: PageTableViewType;
  setViewType: (viewType: PageTableViewType) => void;

  disableTableView?: boolean;
  disableListView?: boolean;
  disableCardView?: boolean;
  disableColumnManagement?: boolean;
  bottomBorder?: boolean;
  sortOptions?: PageTableSortOption[];
};

export function PageTableToolbar<T extends object>(props: PagetableToolbarProps<T>) {
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

  const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage]);
  const onPerPageSelect = useCallback<OnPerPageSelect>(
    (_event, perPage) => setPerPage(perPage),
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

  let viewTypeCount = 0;
  if (!props.disableTableView) viewTypeCount++;
  if (!props.disableCardView) viewTypeCount++;
  if (!props.disableListView) viewTypeCount++;

  if (!showToolbar) {
    return <Fragment />;
  }

  if (itemCount === undefined) {
    return (
      <Toolbar
        className="border-bottom dark-2"
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
      className="dark-2 page-table-toolbar"
      style={{
        paddingBottom: sm ? undefined : 8,
        paddingTop: sm ? undefined : 8,
        borderBottom: bottomBorder ? 'thin solid var(--pf-global--BorderColor--100)' : undefined,
      }}
    >
      <ToolbarContent style={{ justifyContent: 'end', justifyItems: 'end' }}>
        {showSelect && (
          <ToolbarGroup>
            <ToolbarItem variant="bulk-select">
              <BulkSelector {...props} />
            </ToolbarItem>
          </ToolbarGroup>
        )}
        <PageTableToolbarFilters
          toolbarFilters={toolbarFilters}
          filters={filters}
          setFilters={setFilters}
        />
        {/* Action Buttons */}
        <ToolbarGroup variant="button-group">
          <PageActions
            actions={toolbarActions}
            selectedItems={selectedItems}
            wrapper={ToolbarItem}
          />
        </ToolbarGroup>
        <FlexGrowDiv />
        <Flex>
          <PageTableToolbarSort
            sort={sort}
            setSort={setSort}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            sortOptions={sortOptions}
          />
          <ToolbarGroup variant="button-group" style={{ justifyContent: 'end' }}>
            {!props.disableColumnManagement && openColumnModal && viewType === 'table' && (
              <ToolbarItem>
                <Tooltip content={'Manage columns'}>
                  <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
                </Tooltip>
              </ToolbarItem>
            )}
            {viewTypeCount > 1 && (
              <ToolbarItem>
                <ToggleGroup aria-label="table view toggle">
                  {[
                    !props.disableTableView && PageTableViewTypeE.Table,
                    !props.disableListView && PageTableViewTypeE.List,
                    !props.disableCardView && PageTableViewTypeE.Cards,
                  ]
                    .filter((i) => i)
                    .map((vt) => {
                      switch (vt) {
                        case PageTableViewTypeE.Cards:
                          return (
                            <Tooltip
                              content={'Card view'}
                              key={vt}
                              position="top-end"
                              enableFlip={false}
                            >
                              <ToggleGroupItem
                                icon={<ThLargeIcon />}
                                isSelected={viewType === PageTableViewTypeE.Cards}
                                onClick={() => setViewType?.(PageTableViewTypeE.Cards)}
                                aria-label="card view"
                              />
                            </Tooltip>
                          );
                        case PageTableViewTypeE.List:
                          return (
                            <Tooltip
                              content={'List view'}
                              key={vt}
                              position="top-end"
                              enableFlip={false}
                            >
                              <ToggleGroupItem
                                icon={<ListIcon />}
                                isSelected={viewType === PageTableViewTypeE.List}
                                onClick={() => setViewType?.(PageTableViewTypeE.List)}
                                aria-label="list view"
                              />
                            </Tooltip>
                          );
                        case PageTableViewTypeE.Table:
                          return (
                            <Tooltip
                              content={'Table view'}
                              key={vt}
                              position="top-end"
                              enableFlip={false}
                            >
                              <ToggleGroupItem
                                icon={<TableIcon />}
                                isSelected={viewType === PageTableViewTypeE.Table}
                                onClick={() => setViewType?.(PageTableViewTypeE.Table)}
                                aria-label="table view"
                              />
                            </Tooltip>
                          );
                      }
                    })}
                </ToggleGroup>
              </ToolbarItem>
            )}
          </ToolbarGroup>
        </Flex>

        {/* {toolbarButtonActions.length > 0 && <ToolbarGroup variant="button-group">{toolbarActionButtons}</ToolbarGroup>} */}
        {/* <ToolbarGroup variant="button-group">{toolbarActionDropDownItems}</ToolbarGroup> */}

        {/* Pagination */}
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
      </ToolbarContent>
    </Toolbar>
  );
}
