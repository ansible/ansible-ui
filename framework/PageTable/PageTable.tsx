import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  PageSection,
  PerPageOptions,
  Stack,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  CollapseColumn,
  SortByDirection,
  Table /* data-codemods */,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import useResizeObserver from '@react-hook/resize-observer';
import {
  Dispatch,
  Fragment,
  LegacyRef,
  MouseEvent,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { PageDetails } from '../PageDetails/PageDetails';
import { PageDetailsFromColumns } from '../PageDetails/PageDetailsFromColumns';
import { usePageSettings } from '../PageSettings/PageSettingsProvider';
import { PageTableViewType, PageTableViewTypeE } from '../PageToolbar/PageTableViewType';
import { PageToolbar } from '../PageToolbar/PageToolbar';
import { IFilterState, IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { usePageToolbarSortOptionsFromColumns } from '../PageToolbar/PageToolbarSort';
import { EmptyStateError } from '../components/EmptyStateError';
import { EmptyStateNoData } from '../components/EmptyStateNoData';
import { Scrollable, useScrollableState } from '../components/Scrollable';
import { useManageColumns } from '../components/useManageColumns';
import { getID } from '../hooks/useID';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { PageLoadingTable } from './PageLoadingTable';
import { PagePagination } from './PagePagination';
import { PageTableCards } from './PageTableCards';
import {
  ITableColumn,
  TableColumnCell,
  useDescriptionColumns,
  useExpandedColumns,
  useVisibleTableColumns,
} from './PageTableColumn';
import { PageTableList } from './PageTableList';

export type PageTableCommonProps<T extends object> = {
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
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  perPageOptions?: PerPageOptions[];
  sort?: string;
  setSort?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  setSortDirection?: (sortDirection: 'asc' | 'desc') => void;
  compact?: boolean;
  borderless?: boolean;

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

  emptyState?: ReactNode;

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

  /** Optional: Max selections permitted in a table. If this number of selections has been made,
   * the checkboxes on the rest of the rows are disabled until an item is unselected.
   */
  maxSelections?: number;

  /**
   * This will render content between PageToolbar and table header. Set
   * scrollOutsideTable to true, if you want proper scrolling in table.
   */
  topContent?: React.ReactNode;

  toolbarContent?: React.ReactNode;

  /**
   * Limits the filters so that only one filter can be set to an OR operation.
   *
   * Example: AWX can either have an OR on type or status but not both.
   * So once one has 2 selections, the other becomes a single select.
   * Example: (Status is pending or success) and type is inventory.
   */
  limitFiltersToOneOrOperation?: boolean;

  defaultExpandedRows?: boolean;
};

// Define the mutually exclusive types
export type PageTableProps<T extends object> =
  | WithEmptyState<T> // When `emptyState` is provided
  | WithoutEmptyState<T>; // When `emptyState` is not provided

// Define the type when `emptyState` is provided
interface WithEmptyState<T extends object> extends PageTableCommonProps<T> {
  emptyState: ReactNode;
  // Disallow other empty state-related props
  emptyStateTitle?: never;
  emptyStateDescription?: never;
  emptyStateIcon?: never;
  emptyStateNoDataIcon?: never;
  emptyStateActions?: never;
  emptyStateButtonIcon?: never;
  emptyStateButtonText?: never;
  emptyStateButtonClick?: never;
  emptyStateVariant?: never;
}

// Define the type when `emptyState` is NOT provided
interface WithoutEmptyState<T extends object> extends PageTableCommonProps<T> {
  emptyState?: never; // Ensure `emptyState` is not provided

  // Allow other empty state-related props
  emptyStateTitle?: string;
  emptyStateDescription?: string | null;
  emptyStateIcon?: React.ComponentClass;
  emptyStateNoDataIcon?: React.ComponentClass;
  emptyStateActions?: IPageAction<T>[];
  emptyStateButtonIcon?: React.ReactNode;
  emptyStateButtonText?: string | null;
  emptyStateButtonClick?: () => void;
  emptyStateVariant?: 'default' | 'light' | 'dark' | 'darker';
}

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
  const { id, toolbarActions, filterState, error, itemCount } = props;
  const { t } = useTranslation();

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

  const { openColumnManagement, managedColumns } = useManageColumns<T>(
    (id ?? '') + '-columns',
    props.tableColumns,
    viewType !== PageTableViewTypeE.Table,
    viewType !== PageTableViewTypeE.List,
    viewType !== PageTableViewTypeE.Cards
  );

  const sortOptions = usePageToolbarSortOptionsFromColumns(props.tableColumns);
  if (error) {
    return <EmptyStateError titleProp={props.errorStateTitle} message={error.message} />;
  }

  if (itemCount === 0 && Object.keys(filterState ?? {}).length === 0) {
    if (props.emptyState) {
      return props.emptyState;
    }
    return (
      <EmptyStateNoData
        title={props.emptyStateTitle ?? t`No data`}
        description={props.emptyStateDescription}
        icon={props.emptyStateNoDataIcon}
        button={
          (props.emptyStateButtonClick && (
            <Button
              data-cy={
                props.emptyStateButtonText
                  ? convertString(props.emptyStateButtonText)
                  : 'create-resource'
              }
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
      />
    );
  }

  let topContent = props.topContent;
  if (topContent) {
    topContent = (
      <PageSection hasBodyWrapper={false} padding={{ default: 'noPadding' }}>
        {props.topContent}
      </PageSection>
    );
  }

  return (
    <>
      <PageToolbar
        {...props}
        openColumnModal={props.id ? openColumnManagement : undefined}
        showSelect={showSelect}
        viewType={viewType}
        setViewType={setViewType}
        sortOptions={sortOptions}
        limitFiltersToOneOrOperation={props.limitFiltersToOneOrOperation}
      />
      {topContent}
      {viewType === PageTableViewTypeE.Table && (
        <PageTableView {...props} tableColumns={managedColumns} />
      )}
      {viewType === PageTableViewTypeE.List && (
        <Scrollable marginLeft={20} marginRight={20}>
          <PageTableList {...props} showSelect={showSelect} tableColumns={managedColumns} />
        </Scrollable>
      )}
      {viewType === PageTableViewTypeE.Cards && (
        <Scrollable marginLeft={20} marginRight={20}>
          <PageTableCards {...props} showSelect={showSelect} tableColumns={managedColumns} />
        </Scrollable>
      )}
      {!props.disablePagination &&
        (!props.autoHidePagination || (props.itemCount ?? 0) > props.perPage) && (
          <PagePagination {...props} topBorder={!props.autoHidePagination} />
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
    maxSelections,
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
      expandedRowFunctions.push((item) => {
        const hasColumnWithValues = expandedRowColumns.some(
          (column) => column.value?.(item) !== undefined
        );
        if (!hasColumnWithValues) return null;
        return (
          <PageDetails
            disablePadding
            numberOfColumns="multiple"
            labelOrientation="vertical"
            isCompact
            disableScroll
            key={keyFn(item)}
          >
            <PageDetailsFromColumns item={item} columns={expandedRowColumns} />
          </PageDetails>
        );
      });
    }

    if (props.expandedRow) {
      expandedRowFunctions.push(props.expandedRow);
    }

    if (expandedRowFunctions.length === 0) return undefined;

    const newExpandedRow = (item: T) => {
      const expandedRowContent = expandedRowFunctions
        .map((fn) => fn(item))
        .filter((content) => content !== null && content !== undefined);
      if (expandedRowContent.length === 0) return null;
      return <Stack hasGutter>{expandedRowFunctions.map((fn) => fn(item))}</Stack>;
    };

    return newExpandedRow;
  }, [descriptionColumns, expandedRowColumns, keyFn, props.expandedRow]);

  const [translations] = useFrameworkTranslations();
  const showSelect =
    props.showSelect ||
    toolbarActions?.find(
      (action) => 'selection' in action && action.selection === PageActionSelection.Multiple
    ) !== undefined;

  const settings = usePageSettings();

  const [expandColumnWidth, setExpandColumnWidth] = useState(0);

  let returnElement: JSX.Element;
  if (itemCount === undefined || pageItems === undefined) {
    returnElement = <PageLoadingTable />;
  } else if (itemCount === 0) {
    returnElement = (
      <EmptyState
        icon={props.emptyStateIcon ?? SearchIcon}
        titleText={<>{translations.noResultsFound}</>}
        isFullHeight
      >
        <EmptyStateBody>{translations.noResultsMatchCriteria}</EmptyStateBody>
        <EmptyStateFooter>
          {clearAllFilters && (
            <EmptyStateActions>
              <Button variant="primary" onClick={clearAllFilters}>
                {translations.clearAllFilters}
              </Button>
            </EmptyStateActions>
          )}
        </EmptyStateFooter>
      </EmptyState>
    );
  } else {
    returnElement = (
      <Scrollable marginLeft={20} marginRight={20}>
        <Table
          aria-label="Simple table"
          ouiaId="simple-table"
          variant={
            props.compact ? 'compact' : settings.tableLayout === 'compact' ? 'compact' : undefined
          }
          gridBreakPoint=""
          isStickyHeader
          style={{
            borderCollapse: 'separate',
          }}
        >
          <TableHead
            {...props}
            showSelect={showSelect}
            tableColumns={tableColumns}
            onSelect={onSelect}
            expandedRow={expandedRow}
            expandColumnWidth={expandColumnWidth}
            setExpandColumnWidth={setExpandColumnWidth}
          />
          <Tbody>
            {pageItems.map((item, rowIndex) => (
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
                unselectAll={unselectAll}
                onSelect={onSelect}
                expandedRow={expandedRow}
                isLastRow={rowIndex === pageItems.length - 1}
                disableLastRowBorder={props.disableLastRowBorder}
                maxSelections={maxSelections}
                selectedItems={props.selectedItems}
                defaultExpandedRows={props.defaultExpandedRows}
                expandColumnWidth={expandColumnWidth}
              />
            ))}
          </Tbody>
        </Table>
      </Scrollable>
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
  onSelect?: (item: T) => void;
  expandedRow?: (item: T) => ReactNode;
  expandColumnWidth: number;
  setExpandColumnWidth: Dispatch<SetStateAction<number>>;
  pageItems?: T[];
  isSelected?: (item: T) => boolean;
  selectItems?: (items: T[]) => void;
  unselectAll?: () => void;
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
    pageItems,
    isSelected,
    selectItems,
    unselectAll,
  } = props;

  const [_scrollableState, setScrollableState] = useScrollableState();

  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const updateHeaderRowHeight = useCallback(() => {
    if (!headerRowRef.current) return;
    const stickyTop = headerRowRef.current.clientHeight;
    setScrollableState((state) => ({ ...state, stickyTop }));
  }, [setScrollableState]);
  useResizeObserver(headerRowRef, updateHeaderRowHeight);

  const { expandColumnWidth, setExpandColumnWidth } = props;
  const expandColumnRef = useRef<Element>(null);
  const updateExpandColumnWidth = useCallback(() => {
    if (!expandColumnRef.current) return;
    setExpandColumnWidth(expandColumnRef.current.clientWidth);
  }, [setExpandColumnWidth]);
  useResizeObserver(expandColumnRef, updateExpandColumnWidth);

  const [checkboxColumnWidth, setCheckboxColumnWidth] = useState(0);
  const checkboxColumnRef = useRef<Element>(null);
  const updateCheckboxColumnWidth = useCallback(() => {
    if (!checkboxColumnRef.current) return;
    setCheckboxColumnWidth(checkboxColumnRef.current.clientWidth);
  }, []);
  useResizeObserver(checkboxColumnRef, updateCheckboxColumnWidth);

  useEffect(() => {
    setScrollableState((state) => ({
      ...state,
      stickyLeft: expandColumnWidth + checkboxColumnWidth,
    }));
  }, [expandColumnWidth, checkboxColumnWidth, setScrollableState]);

  const actionColumnRef = useRef<Element>(null);
  const updateActionColumnWidth = useCallback(() => {
    if (!actionColumnRef.current) return;
    const stickyRight = actionColumnRef.current.clientWidth;
    setScrollableState((state) => ({ ...state, stickyRight }));
  }, [setScrollableState]);
  useResizeObserver(actionColumnRef, updateActionColumnWidth);

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
    <Thead style={{ background: 'inherit' }}>
      <Tr style={{ background: 'inherit' }} ref={headerRowRef}>
        {expandedRow && (
          <Th
            aria-label="Expand"
            isStickyColumn
            stickyMinWidth="1px"
            ref={expandColumnRef as LegacyRef<HTMLTableCellElement>}
          />
        )}
        {(showSelect || onSelect) && (
          <Th
            aria-label="Select"
            isStickyColumn
            stickyMinWidth="1px"
            data-cy={'selections-column-header'}
            data-testid={'selections-column-header'}
            style={{ left: expandColumnWidth }}
            ref={checkboxColumnRef as LegacyRef<HTMLTableCellElement>}
            select={{
              onSelect: (_event, isSelecting) => {
                if (isSelecting) {
                  selectItems?.(pageItems ?? []);
                } else {
                  unselectAll?.();
                }
              },
              isSelected:
                pageItems && pageItems.length > 0
                  ? pageItems.every((item) => isSelected?.(item))
                  : false,
            }}
          ></Th>
        )}
        {columns.map((column, index) => {
          return (
            <Th
              aria-label={column.header}
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
                width: column.fullWidth ? '100%' : undefined,
              }}
              data-cy={getID(column.header + '-column-header')}
              data-testid={getID(column.header + '-column-header')}
            >
              {column.header}
            </Th>
          );
        })}
        {itemActions !== undefined && (
          <Th
            aria-label="Actions"
            isStickyColumn
            stickyMinWidth="1px"
            data-cy={'action-column-header'}
            data-testid={'action-column-header'}
            ref={actionColumnRef as LegacyRef<HTMLTableCellElement>}
          />
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
  onSelect?: (item: T) => void;
  unselectAll?: () => void;
  expandedRow?: (item: T) => ReactNode;
  isLastRow?: boolean;
  disableLastRowBorder?: boolean;
  maxSelections?: number;
  selectedItems?: T[];
  defaultExpandedRows?: boolean;
  expandColumnWidth: number;
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
    maxSelections,
    selectedItems,
  } = props;
  const expandedRowContent = expandedRow?.(item);
  const { expandColumnWidth } = props;
  const [expanded, setExpanded] = useState(!!props.defaultExpandedRows && !!expandedRowContent);
  const disableRow = useCallback(
    (item: T) => {
      if (selectedItems?.length === maxSelections) {
        // disable checkboxes for remaining rows
        return !selectedItems?.includes(item);
      }
      return false;
    },
    [maxSelections, selectedItems]
  );

  const rowId =
    'id' in item && (typeof item.id === 'string' || typeof item.id === 'number')
      ? `row-id-${item.id.toString()}`
      : `row-${rowIndex}`;

  return (
    <>
      <Tr
        style={{
          boxShadow: 'unset',
          borderBottom: expanded || (props.isLastRow && disableLastRowBorder) ? 'unset' : undefined,
          cursor: onSelect ? 'pointer' : 'default',
        }}
        data-testid={rowId}
        data-cy={rowId}
        onClick={() => {
          if (!onSelect) return;
          if (!isSelectMultiple) {
            unselectAll?.();
          }
          if (isSelectMultiple && isItemSelected) {
            unselectItem?.(item);
          } else {
            selectItem?.(item);
          }
          onSelect(item);
        }}
      >
        {expandedRow && (
          <Td
            expand={
              expandedRowContent
                ? {
                    rowIndex,
                    isExpanded: expanded,
                    onToggle: () => setExpanded((expanded) => !expanded),
                  }
                : undefined
            }
            data-cy={'expand-column-cell'}
            data-testid={'expand-column-cell'}
            isStickyColumn
            stickyMinWidth="1px"
            className={expanded && expandedRowContent ? 'expanded' : undefined}
          />
        )}
        {showSelect && (
          <Td
            select={
              isItemSelected !== undefined
                ? {
                    rowIndex,
                    onSelect: (_event, isSelecting) => {
                      if (isSelecting) {
                        selectItem?.(item);
                      } else {
                        unselectItem?.(item);
                      }
                    },
                    isSelected: isItemSelected,
                    isDisabled: maxSelections && selectedItems ? disableRow(item) : false,
                  }
                : undefined
            }
            isStickyColumn
            stickyMinWidth="1px"
            data-cy={'checkbox-column-cell'}
            data-testid={'checkbox-column-cell'}
            style={{ left: expandColumnWidth }}
            className={expandedRow && expanded && expandedRowContent ? 'expanded' : undefined}
          />
        )}
        {onSelect && (
          <Td
            select={{
              rowIndex,
              isSelected: isItemSelected ?? false,
              variant: isSelectMultiple ? 'checkbox' : 'radio',
              isDisabled: maxSelections && selectedItems ? disableRow(item) : false,
              props: { 'aria-label': 'Select row' },
            }}
            isStickyColumn
            stickyMinWidth="1px"
            data-cy={'checkbox-column-cell'}
            data-testid={'checkbox-column-cell'}
          />
        )}
        <TableCells
          columns={columns}
          item={item}
          rowActions={rowActions}
          expanded={!!expandedRow && !!expanded && !!expandedRowContent}
        />
      </Tr>
      {expandedRow && expanded && expandedRowContent && (
        <Tr isExpanded={expanded} style={{ boxShadow: 'unset' }}>
          <Td isStickyColumn stickyMinWidth="1px" />
          {showSelect && (
            <Td
              aria-label="Select"
              isStickyColumn
              stickyMinWidth="1px"
              style={{ left: expandColumnWidth }}
            />
          )}
          {onSelect && (
            <Td isStickyColumn stickyMinWidth="1px" style={{ left: expandColumnWidth }} />
          )}
          <Td colSpan={columns.length}>
            <CollapseColumn>{expandedRowContent}</CollapseColumn>
          </Td>
          {rowActions !== undefined && rowActions.length > 0 && (
            <Td isActionCell isStickyColumn stickyMinWidth="1px">
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
  expanded?: boolean;
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
            data-cy={getID(column.header + '-column-cell')}
            data-testid={getID(column.header + '-column-cell')}
            className={props.expanded ? 'expanded' : undefined}
          >
            <TableColumnCell item={item} column={column} />
          </Td>
        );
      })}
      {rowActions !== undefined && rowActions.length > 0 && (
        <Td
          isActionCell
          isStickyColumn
          stickyMinWidth="1px"
          style={{
            zIndex: actionsExpanded ? 400 : undefined, // ZIndex 400 is needed for PF table stick headers
          }}
          data-cy={'actions-column-cell'}
          data-testid={'actions-column-cell'}
          className={props.expanded ? 'expanded' : undefined}
        >
          <PageActions
            actions={rowActions}
            selectedItem={item}
            position={'right'}
            iconOnly
            onOpen={setActionsExpanded}
          />
        </Td>
      )}
    </Fragment>
  );
}

function convertString(s: string) {
  return s.toLowerCase().split(' ').join('-');
}
