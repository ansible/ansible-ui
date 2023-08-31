import {
  Bullseye,
  Button,
  DropdownPosition,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Flex,
  PageSection,
  Skeleton,
  Spinner,
  Stack,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  CollapseColumn,
  SortByDirection,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';
import useResizeObserver from '@react-hook/resize-observer';
import {
  Dispatch,
  Fragment,
  MouseEvent,
  ReactNode,
  SetStateAction,
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { IPageAction, PageActionSelection } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { PageBody } from '../PageBody';
import { PageDetailsFromColumns } from '../PageDetails/PageDetailsFromColumns';
import { PageTableViewType, PageTableViewTypeE } from '../PageToolbar/PageTableViewType';
import { PageToolbar } from '../PageToolbar/PageToolbar';
import { IFilterState, IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { usePageToolbarSortOptionsFromColumns } from '../PageToolbar/PageToolbarSort';
import { useSettings } from '../Settings';
import { EmptyStateError } from '../components/EmptyStateError';
import { EmptyStateNoData } from '../components/EmptyStateNoData';
import { Scrollable } from '../components/Scrollable';
import { useBreakpoint } from '../components/useBreakPoint';
import { useManageColumns } from '../components/useManageColumns';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { PagePagination } from './PagePagination';
import './PageTable.css';
import { PageTableCards } from './PageTableCards';
import {
  ITableColumn,
  TableColumnCell,
  useDescriptionColumns,
  useExpandedColumns,
  useVisibleTableColumns,
} from './PageTableColumn';
import { PageTableList } from './PageTableList';

const ScrollDiv = styled.div`
  height: 100%;
`;

const ErrorStateDiv = styled.div`
  height: 100%;
  background-color: var(--pf-global--BackgroundColor--100);
`;

const TableCellDiv = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
`;

const ColumnCellDiv = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
`;

export type IPaginationRelatedProps = {
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
};

export type PageTableProps<T extends object> = {
  id?: string;

  keyFn: (item: T) => string | number;

  itemCount?: number;

  /** The current page of items to show. If undefined, then the table shows a loading state. */
  pageItems: T[] | undefined;

  toolbarActions?: IPageAction<T>[];
  tableColumns: ITableColumn<T>[];
  rowActions?: IPageAction<T>[];

  toolbarFilters?: IToolbarFilter[];
  filterState?: IFilterState;
  setFilterState?: Dispatch<SetStateAction<IFilterState>>;
  clearAllFilters?: () => void;
  pagination?: IPaginationRelatedProps;
  sort?: string;
  setSort?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  setSortDirection?: (sortDirection: 'asc' | 'desc') => void;
  compact?: boolean;

  /** Auto hide the pagination at the bottom of the table if there are less items than in a page. */
  autoHidePagination?: boolean;

  isSelected?: (item: T) => boolean;
  isSelectMultiple?: boolean;
  selectedItems?: T[];
  selectItem?: (item: T) => void;
  unselectItem?: (item: T) => void;
  selectItems?: (items: T[]) => void;
  unselectAll?: () => void;

  /**
   * Callback where if defined, enables single selection of items in the table.
   */
  // TODO rename to onSingleSelect
  onSelect?: (item: T) => void;

  // TODO make error state a react component? <TableError /> What to do if not provided? - reuse CommonEmptyStates
  // TODO make empty state a react component? <TableEmpty /> What to do if not provided? - reuse CommonEmptyStates

  errorStateTitle: string;
  error?: Error;

  emptyStateTitle: string;
  emptyStateDescription?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emptyStateIcon?: React.ComponentType<any>;
  emptyStateActions?: IPageAction<T>[];
  emptyStateButtonIcon?: React.ReactNode;
  emptyStateButtonText?: string | null;
  emptyStateButtonClick?: () => void;
  emptyStateVariant?: 'default' | 'light' | 'dark' | 'darker';

  /**
   * Enables multi-selection of items even though there are no actions that are bulk actions.
   * This is used in the bulk select dialog where the selected items are used outside the table.
   */
  // TODO rename to showMultiSelect
  showSelect?: boolean;

  disableTableView?: boolean;
  disableListView?: boolean;
  disableCardView?: boolean;

  // TODO remember user setting so that when they return to this table it uses their last setting
  defaultTableView?: PageTableViewType;

  /**
   * Disables the padding that shows up on large screens around the table.
   * Used in modals and other places.
   */
  // TODO - There is a request to add a user setting to allow users to turn off padding.
  disableBodyPadding?: boolean;
  disablePagination?: boolean;
  /**
   * Default subtitle is used in list and card views as the default subtitle if there is no subtitle column.
   * Example is team card that has the work 'team' under the team name. Makes the card feel polished.
   */
  defaultSubtitle?: ReactNode;

  /**
   * A render function that if defined, enables expanded row content.
   * Columns that are marked as expanded content will enable the expanded row
   * and will add to the content returned from the expandedRow render function.
   */
  expandedRow?: (item: T) => ReactNode;

  disableLastRowBorder?: boolean;

  /**
   * This will render content between PageToolbar and table hader. Set scrollOutsideTable to true, if you want proper scrolling in table.
   */
  topContent?: React.ReactNode;

  /**
   * If topContent is set and this variable is set to true, it will render scrollable area outside of both table and topContent,
   * if set to false (or not set at all), scrollable area will render in table only (default setting).
   */
  scrollOutsideTable?: boolean;
};

/**
 * The PageTable component is used for adding a table to a page.
 *
 * See the [Table Guide](docs/guides/PageTableGuide.md).
 *
 * @example
 * ```tsx
 * <Page>
 *   <PageLayout>
 *     <PageHeader ... />
 *     <PageTable ... />
 *   </PageLayout>
 * </Page>
 * ```
 */
export function PageTable<T extends object>(props: PageTableProps<T>) {
  const { id, toolbarActions, filterState, error, itemCount, disableBodyPadding, pagination } =
    props;

  const { openColumnManagement, managedColumns } = useManageColumns<T>(
    (id ?? '') + '-columns',
    props.tableColumns,
    props.disableTableView,
    props.disableListView,
    props.disableCardView
  );

  const showSelect =
    props.showSelect ||
    toolbarActions?.find(
      (action) => 'selection' in action && action.selection === PageActionSelection.Multiple
    ) !== undefined;

  const hasTableViewType = !props.disableTableView;
  const hasListViewType = !props.disableListView;
  // const hasCardViewType = !props.disableCardView;

  const [viewType, setViewTypeState] = useState<PageTableViewType>(() => {
    const value = props.id ? localStorage.getItem(props.id + '-view') : undefined;
    switch (value) {
      case 'table':
        return PageTableViewTypeE.Table;
      case 'list':
        return PageTableViewTypeE.List;
      case 'cards':
        return PageTableViewTypeE.Cards;
    }
    return (
      props.defaultTableView ??
      (hasTableViewType
        ? PageTableViewTypeE.Table
        : hasListViewType
        ? PageTableViewTypeE.List
        : PageTableViewTypeE.Cards)
    );
  });
  const setViewType = useCallback(
    (viewType: PageTableViewType) => {
      setViewTypeState(viewType);
      if (props.id) {
        localStorage.setItem(props.id + '-view', viewType);
      }
    },
    [props.id]
  );

  const usePadding = useBreakpoint('md') && disableBodyPadding !== true;

  const sortOptions = usePageToolbarSortOptionsFromColumns(props.tableColumns);
  const needsPagination = !props.disablePagination && pagination;
  if (error) {
    return (
      <ErrorStateDiv>
        <EmptyStateError titleProp={props.errorStateTitle} message={error.message} />
      </ErrorStateDiv>
    );
  }

  if (itemCount === 0 && Object.keys(filterState ?? {}).length === 0) {
    return (
      <PageSection style={{ backgroundColor: 'transparent' }}>
        <EmptyStateNoData
          title={props.emptyStateTitle}
          description={props.emptyStateDescription}
          button={
            (props.emptyStateButtonClick && (
              <Button
                variant="primary"
                onClick={props.emptyStateButtonClick}
                icon={props.emptyStateButtonIcon ? props.emptyStateButtonIcon : null}
              >
                {props.emptyStateButtonText}
              </Button>
            )) ||
            (props.emptyStateActions && (
              <Flex justifyContent={{ default: 'justifyContentCenter' }}>
                <PageActions actions={props.emptyStateActions} />
              </Flex>
            ))
          }
          variant={EmptyStateVariant.large}
        />
      </PageSection>
    );
  }

  if (itemCount === undefined) {
    return (
      <PageSection isFilled variant="light">
        <Bullseye>
          <Spinner />
        </Bullseye>
      </PageSection>
    );
  }

  let tableContent = (
    <>
      {props.topContent && <PageSection>{props.topContent}</PageSection>}
      <PageTableView {...props} {...pagination} tableColumns={managedColumns} />
    </>
  );

  if (props.scrollOutsideTable) {
    tableContent = <Scrollable>{tableContent}</Scrollable>;
  }

  return (
    <>
      <PageToolbar
        {...props}
        openColumnModal={props.id ? openColumnManagement : undefined}
        showSelect={showSelect}
        viewType={viewType}
        setViewType={setViewType}
        bottomBorder
        sortOptions={sortOptions}
      />
      {viewType === PageTableViewTypeE.Table && (
        <PageBody disablePadding={disableBodyPadding}>{tableContent}</PageBody>
      )}
      {viewType === PageTableViewTypeE.List && (
        <Scrollable>
          {props.topContent && <PageSection>{props.topContent}</PageSection>}
          <PageSection padding={{ default: 'noPadding', md: 'padding' }}>
            <div
              style={{
                borderLeft: usePadding
                  ? 'thin solid var(--pf-global--BorderColor--100)'
                  : undefined,
                borderRight: usePadding
                  ? 'thin solid var(--pf-global--BorderColor--100)'
                  : undefined,
              }}
            >
              <PageTableList {...props} showSelect={showSelect} tableColumns={managedColumns} />
            </div>
          </PageSection>
        </Scrollable>
      )}
      {viewType === PageTableViewTypeE.Cards && (
        <Scrollable>
          {props.topContent && <PageSection>{props.topContent}</PageSection>}
          <PageTableCards {...props} showSelect={showSelect} tableColumns={managedColumns} />
        </Scrollable>
      )}
      {needsPagination &&
        (!props.autoHidePagination ||
          (pagination.perPage && (props.itemCount ?? 0) > pagination.perPage)) && (
          <PagePagination {...props} {...pagination} topBorder />
        )}
    </>
  );
}

function PageTableView<T extends object>(props: PageTableProps<T>) {
  const {
    pageItems,
    selectItem,
    unselectItem,
    isSelected,
    isSelectMultiple,
    keyFn,
    rowActions,
    toolbarActions,
    itemCount,
    clearAllFilters,
    onSelect,
    unselectAll,
  } = props;

  const tableColumns = useVisibleTableColumns(props.tableColumns);

  const descriptionColumns = useDescriptionColumns(props.tableColumns);
  const expandedRowColumns = useExpandedColumns(props.tableColumns);
  const expandedRow = useMemo(() => {
    const expandedRowFunctions: ((item: T) => ReactNode)[] = [];

    if (descriptionColumns.length) {
      for (const descriptionColumn of descriptionColumns) {
        if ('value' in descriptionColumn) {
          expandedRowFunctions.push((item) => {
            const value = descriptionColumn.value?.(item);
            if (value) {
              return <div key={descriptionColumn.id ?? descriptionColumn.header}>{value}</div>;
            }
          });
        } else {
          expandedRowFunctions.push((item) => descriptionColumn.cell(item));
        }
      }
    }

    if (expandedRowColumns.length) {
      expandedRowFunctions.push((item) => (
        <PageDetailsFromColumns
          key={keyFn(item)}
          item={item}
          columns={expandedRowColumns}
          disablePadding
          numberOfColumns="multiple"
        />
      ));
    }

    if (props.expandedRow) {
      expandedRowFunctions.push(props.expandedRow);
    }

    if (expandedRowFunctions.length === 0) return undefined;
    if (expandedRowFunctions.length === 1) return expandedRowFunctions[0];

    const newExpandedRow = (item: T) => (
      <Stack hasGutter style={{ gap: 12 }}>
        {expandedRowFunctions.map((fn) => fn(item))}
      </Stack>
    );

    return newExpandedRow;
  }, [descriptionColumns, expandedRowColumns, keyFn, props.expandedRow]);

  const [translations] = useFrameworkTranslations();
  const showSelect =
    props.showSelect ||
    toolbarActions?.find(
      (action) => 'selection' in action && action.selection === PageActionSelection.Multiple
    ) !== undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }>({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const updateScroll = useCallback((div: HTMLDivElement | null) => {
    if (!div) return;
    setScroll({
      top: div.scrollTop,
      bottom: div.scrollHeight - div.clientHeight - div.scrollTop,
      left: div.scrollLeft,
      right: div.scrollWidth - div.clientWidth - div.scrollLeft,
    });
  }, []);
  const onScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => updateScroll(event.currentTarget),
    [updateScroll]
  );
  useResizeObserver(containerRef, () => updateScroll(containerRef.current));
  useEffect(() => updateScroll(containerRef.current), [updateScroll]);

  const settings = useSettings();

  let returnElement = (
    <>
      <TableComposable
        aria-label="Simple table"
        variant={
          props.compact ? 'compact' : settings.tableLayout === 'compact' ? 'compact' : undefined
        }
        gridBreakPoint=""
        isStickyHeader
        className="page-table"
      >
        {itemCount === undefined ? (
          <Thead>
            <Tr>
              <Th>
                <Skeleton />
              </Th>
            </Tr>
          </Thead>
        ) : (
          <TableHead
            {...props}
            showSelect={showSelect}
            scrollLeft={scroll.left > 0}
            scrollRight={scroll.right > 1}
            tableColumns={tableColumns}
            onSelect={onSelect}
            expandedRow={expandedRow}
          />
        )}
        <Tbody>
          {itemCount === undefined
            ? new Array(10).fill(0).map((_, index) => (
                <Tr key={index}>
                  <Td>
                    <TableCellDiv>
                      <Skeleton height="27px" />
                    </TableCellDiv>
                  </Td>
                </Tr>
              ))
            : pageItems === undefined
            ? new Array(Math.min(10, itemCount)).fill(0).map((_, index) => (
                <Tr key={index}>
                  {showSelect && <Td></Td>}
                  <Td colSpan={tableColumns.length}>
                    <ColumnCellDiv>
                      <Skeleton height="27px" />
                    </ColumnCellDiv>
                  </Td>
                </Tr>
              ))
            : pageItems?.map((item, rowIndex) => (
                <TableRow<T>
                  key={keyFn ? keyFn(item) : rowIndex}
                  columns={tableColumns}
                  item={item}
                  isItemSelected={isSelected?.(item)}
                  isSelectMultiple={isSelectMultiple}
                  selectItem={selectItem}
                  unselectItem={unselectItem}
                  rowActions={rowActions}
                  rowIndex={rowIndex}
                  showSelect={showSelect}
                  scrollLeft={scroll.left > 0}
                  scrollRight={scroll.right > 1}
                  unselectAll={unselectAll}
                  onSelect={onSelect}
                  expandedRow={expandedRow}
                  isLastRow={rowIndex === pageItems.length - 1}
                  disableLastRowBorder={props.disableLastRowBorder}
                />
              ))}
        </Tbody>
      </TableComposable>
      {itemCount === 0 && (
        <EmptyState style={{ paddingTop: 48 }}>
          <EmptyStateIcon icon={SearchIcon} />
          <Title headingLevel="h2" size="lg">
            {translations.noResultsFound}
          </Title>
          <EmptyStateBody>{translations.noResultsMatchCriteria}</EmptyStateBody>
          {clearAllFilters && (
            <EmptyStateSecondaryActions>
              <Button variant="primary" onClick={clearAllFilters}>
                {translations.clearAllFilters}
              </Button>
            </EmptyStateSecondaryActions>
          )}
        </EmptyState>
      )}
    </>
  );

  if (!props.scrollOutsideTable) {
    returnElement = (
      <ScrollDiv className="pf-c-scroll-inner-wrapper" ref={containerRef} onScroll={onScroll}>
        {returnElement}
      </ScrollDiv>
    );
  }

  return returnElement;
}

function TableHead<T extends object>(props: {
  tableColumns: ITableColumn<T>[];
  rowActions?: IPageAction<T>[];
  sort?: string;
  setSort?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  setSortDirection?: (sortDirection: 'asc' | 'desc') => void;
  showSelect?: boolean;
  scrollLeft?: boolean;
  scrollRight?: boolean;
  onSelect?: (item: T) => void;
  expandedRow?: (item: T) => ReactNode;
}) {
  const {
    tableColumns: columns,
    rowActions: itemActions,
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    showSelect,
    onSelect,
    expandedRow,
  } = props;

  const getColumnSort = useCallback<
    (columnIndex: number, column: ITableColumn<T>) => ThSortType | undefined
  >(
    (columnIndex: number, column: ITableColumn<T>) => {
      if (!column.sort) return undefined;
      return {
        onSort: (_event: MouseEvent, _columnIndex: number, sortByDirection: SortByDirection) => {
          if (column.sort) {
            setSort?.(column.sort);
            setSortDirection?.(sortByDirection);
          }
        },
        sortBy: {
          index: column.sort === sort ? columnIndex : undefined,
          direction: column.sort === sort ? sortDirection : undefined,
          defaultDirection: column.defaultSortDirection,
        },
        columnIndex,
      };
    },
    [setSort, setSortDirection, sort, sortDirection]
  );

  return (
    <Thead>
      <Tr className="light dark-2">
        {expandedRow && <Th style={{ padding: 0, backgroundColor: 'inherit' }} />}
        {(showSelect || onSelect) && (
          <Th
            isStickyColumn
            stickyMinWidth="0px"
            hasRightBorder={props.scrollLeft}
            style={{ backgroundColor: 'inherit' }}
          >
            &nbsp;
          </Th>
        )}
        {columns.map((column, index) => {
          return (
            <Th
              key={column.header}
              sort={getColumnSort(index, column)}
              modifier="nowrap"
              style={{
                minWidth:
                  column.minWidth === 0
                    ? '1%'
                    : column.minWidth !== undefined
                    ? column.minWidth
                    : undefined,
                maxWidth: column.maxWidth !== undefined ? column.maxWidth : undefined,
                backgroundColor: 'inherit',
              }}
            >
              {column.header}
            </Th>
          );
        })}
        {itemActions !== undefined && (
          <Td
            isActionCell
            isStickyColumn
            stickyMinWidth="0px"
            style={{
              right: 0,
              padding: 0,
              paddingRight: 0,
              backgroundColor: 'inherit',
              zIndex: 302,
            }}
            className={props.scrollRight ? 'pf-m-border-left' : undefined}
          >
            &nbsp;
          </Td>
        )}
      </Tr>
    </Thead>
  );
}

function TableRow<T extends object>(props: {
  columns: ITableColumn<T>[];
  item: T;
  isItemSelected?: boolean;
  isSelectMultiple?: boolean;
  selectItem?: (item: T) => void;
  unselectItem?: (item: T) => void;
  rowActions?: IPageAction<T>[];
  rowIndex: number;
  showSelect: boolean;
  scrollLeft?: boolean;
  scrollRight?: boolean;
  onSelect?: (item: T) => void;
  unselectAll?: () => void;
  expandedRow?: (item: T) => ReactNode;
  isLastRow?: boolean;
  disableLastRowBorder?: boolean;
}) {
  const {
    columns,
    unselectAll,
    selectItem,
    unselectItem,
    isItemSelected,
    isSelectMultiple,
    item,
    rowActions,
    rowIndex,
    showSelect,
    onSelect,
    expandedRow,
    disableLastRowBorder,
  } = props;
  const [expanded, setExpanded] = useState(false);
  const settings = useSettings();
  const expandedContent = expandedRow?.(item);
  return (
    <>
      <Tr
        isRowSelected={expanded}
        style={{
          boxShadow: 'unset',
          borderBottom: expanded || (props.isLastRow && disableLastRowBorder) ? 'unset' : undefined,
        }}
      >
        {expandedRow && (
          <Td
            expand={
              expandedContent
                ? {
                    rowIndex,
                    isExpanded: expanded,
                    onToggle: () => setExpanded((expanded) => !expanded),
                  }
                : undefined
            }
            style={{ paddingLeft: expandedContent ? 8 : 4 }}
          />
        )}
        {showSelect && (
          <Th
            select={
              isItemSelected !== undefined
                ? {
                    onSelect: (_event, isSelecting) => {
                      if (isSelecting) {
                        selectItem?.(item);
                      } else {
                        unselectItem?.(item);
                      }
                    },
                    isSelected: isItemSelected,
                  }
                : undefined
            }
            isStickyColumn
            stickyMinWidth="0px"
            hasRightBorder={props.scrollLeft}
          />
        )}
        {onSelect && (
          <Td
            select={{
              rowIndex,
              onSelect: () => {
                if (!isSelectMultiple) {
                  unselectAll?.();
                }
                selectItem?.(item);
                onSelect?.(item);
              },
              isSelected: isItemSelected ?? false,
              variant: isSelectMultiple ? 'checkbox' : 'radio',
            }}
            isStickyColumn
            stickyMinWidth="0px"
            hasRightBorder={props.scrollLeft}
          />
        )}
        <TableCells
          columns={columns}
          item={item}
          rowActions={rowActions}
          scrollLeft={props.scrollLeft}
          scrollRight={props.scrollRight}
        />
      </Tr>
      {expandedRow && expanded && expandedContent && (
        <Tr isExpanded={expanded} style={{ boxShadow: 'unset' }}>
          <Td />
          {showSelect && (
            <Th isStickyColumn stickyMinWidth="0px" hasRightBorder={props.scrollLeft} />
          )}
          {onSelect && <Td isStickyColumn stickyMinWidth="0px" hasRightBorder={props.scrollLeft} />}
          <Td
            colSpan={columns.length}
            style={{ paddingBottom: settings.tableLayout === 'compact' ? 12 : 24, paddingTop: 0 }}
          >
            <CollapseColumn>{expandedContent}</CollapseColumn>
          </Td>
          {rowActions !== undefined && rowActions.length > 0 && (
            <Td
              isActionCell
              isStickyColumn
              stickyMinWidth="0px"
              style={{
                right: 0,
                padding: 0,
                paddingRight: 0,
              }}
              className={props.scrollRight ? 'pf-m-border-left' : undefined}
            >
              &nbsp;
            </Td>
          )}
        </Tr>
      )}
    </>
  );
}

function TableCells<T extends object>(props: {
  columns: ITableColumn<T>[];
  item: T;
  rowActions?: IPageAction<T>[];
  scrollLeft?: boolean;
  scrollRight?: boolean;
}) {
  const { columns, item, rowActions } = props;
  const [actionsExpanded, setActionsExpanded] = useState(false);
  return (
    <Fragment>
      {columns.map((column) => {
        return (
          <Td
            key={column.header}
            dataLabel={column.header}
            modifier="nowrap"
            style={{ width: column.minWidth === 0 ? '0%' : undefined }}
          >
            <TableColumnCell item={item} column={column} />
          </Td>
        );
      })}
      {rowActions !== undefined && rowActions.length > 0 && (
        <Td
          isActionCell
          isStickyColumn
          stickyMinWidth="0px"
          style={{
            right: 0,
            padding: 0,
            paddingRight: 8,
            zIndex: actionsExpanded ? 400 : undefined, // ZIndex 400 is needed for PF table stick headers
          }}
          className={props.scrollRight ? 'pf-m-border-left' : undefined}
        >
          <PageActions
            actions={rowActions}
            selectedItem={item}
            position={DropdownPosition.right}
            iconOnly
            onOpen={setActionsExpanded}
          />
        </Td>
      )}
    </Fragment>
  );
}
