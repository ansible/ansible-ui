import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Flex,
  PageSection,
  PerPageOptions,
  Stack,
} from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
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
import { PageDetails } from '../PageDetails/PageDetails';
import { PageDetailsFromColumns } from '../PageDetails/PageDetailsFromColumns';
import { usePageSettings } from '../PageSettings/PageSettingsProvider';
import { PageTableViewType, PageTableViewTypeE } from '../PageToolbar/PageTableViewType';
import { PageToolbar } from '../PageToolbar/PageToolbar';
import { IFilterState, IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { usePageToolbarSortOptionsFromColumns } from '../PageToolbar/PageToolbarSort';
import { EmptyStateError } from '../components/EmptyStateError';
import { EmptyStateNoData } from '../components/EmptyStateNoData';
import { Scrollable } from '../components/Scrollable';
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

const ScrollDiv = styled.div`
  flex: 1;
`;

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

  // hides table - useful for Analytics, where there is preview mode which shows toolbar and chart (as topContent props), but no table
  hideTable?: boolean;

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
   * If topContent is set and this variable is set to true, topContent will be scrolled with table.
   */
  scrollTopContent?: boolean;

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
    return (
      <EmptyStateNoData
        title={props.emptyStateTitle}
        description={props.emptyStateDescription}
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
      <PageSection
        variant="light"
        padding={{ default: 'noPadding' }}
        style={{
          borderBottom: 'thin solid var(--pf-v5-global--BorderColor--100)',
        }}
      >
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
      {viewType === PageTableViewTypeE.Table && (
        <>
          {props.scrollTopContent ? (
            <Scrollable>
              {topContent}
              {!props.hideTable && <PageTableView {...props} tableColumns={managedColumns} />}
            </Scrollable>
          ) : (
            <>
              {topContent}
              {!props.hideTable && <PageTableView {...props} tableColumns={managedColumns} />}
            </>
          )}
        </>
      )}
      {viewType === PageTableViewTypeE.List && (
        <>
          {props.scrollTopContent ? (
            <Scrollable>
              {topContent}
              <PageSection padding={{ default: 'noPadding' }}>
                {!props.hideTable && (
                  <PageTableList {...props} showSelect={showSelect} tableColumns={managedColumns} />
                )}
              </PageSection>
            </Scrollable>
          ) : (
            <>
              {topContent}
              <Scrollable>
                <PageSection padding={{ default: 'noPadding' }}>
                  {!props.hideTable && (
                    <PageTableList
                      {...props}
                      showSelect={showSelect}
                      tableColumns={managedColumns}
                    />
                  )}
                </PageSection>
              </Scrollable>
            </>
          )}
        </>
      )}
      {viewType === PageTableViewTypeE.Cards && (
        <>
          {props.scrollTopContent ? (
            <Scrollable>
              {topContent}
              {!props.hideTable && (
                <PageTableCards {...props} showSelect={showSelect} tableColumns={managedColumns} />
              )}
            </Scrollable>
          ) : (
            <>
              {topContent}
              <Scrollable>
                {!props.hideTable && (
                  <PageTableCards
                    {...props}
                    showSelect={showSelect}
                    tableColumns={managedColumns}
                  />
                )}
              </Scrollable>
            </>
          )}
        </>
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
          >
            <PageDetailsFromColumns key={keyFn(item)} item={item} columns={expandedRowColumns} />
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

  const settings = usePageSettings();

  let returnElement: JSX.Element;
  if (props.itemCount === undefined || pageItems === undefined) {
    returnElement = <PageLoadingTable />;
  } else {
    returnElement = (
      <>
        <Table
          aria-label="Simple table"
          ouiaId="simple-table"
          variant={
            props.compact ? 'compact' : settings.tableLayout === 'compact' ? 'compact' : undefined
          }
          borders={!props.borderless}
          gridBreakPoint=""
          isStickyHeader
          className="page-table"
        >
          <TableHead
            {...props}
            showSelect={showSelect}
            scrollLeft={scroll.left > 0}
            scrollRight={scroll.right > 1}
            tableColumns={tableColumns}
            onSelect={onSelect}
            expandedRow={expandedRow}
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
                scrollLeft={scroll.left > 0}
                scrollRight={scroll.right > 1}
                unselectAll={unselectAll}
                onSelect={onSelect}
                expandedRow={expandedRow}
                isLastRow={rowIndex === pageItems.length - 1}
                disableLastRowBorder={props.disableLastRowBorder}
                maxSelections={maxSelections}
                selectedItems={props.selectedItems}
                defaultExpandedRows={props.defaultExpandedRows}
              />
            ))}
          </Tbody>
        </Table>
        {itemCount === 0 && (
          <EmptyState isFullHeight>
            <EmptyStateHeader
              titleText={<>{translations.noResultsFound}</>}
              icon={<EmptyStateIcon icon={SearchIcon} />}
              headingLevel="h2"
            />
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
        )}
      </>
    );
  }

  if (!props.scrollTopContent) {
    returnElement = (
      <ScrollDiv
        className="pf-v5-c-scroll-inner-wrapper"
        ref={containerRef}
        onScroll={onScroll}
        style={{
          backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
        }}
      >
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
      <Tr className="bg-lighten">
        {expandedRow && <Th style={{ padding: 0 }} className="bg-lighten" />}
        {(showSelect || onSelect) && (
          <Th
            isStickyColumn
            stickyMinWidth="0px"
            hasRightBorder={props.scrollLeft}
            data-cy={'selections-column-header'}
            className={props.scrollLeft ? 'bg-lighten-2' : 'bg-lighten'}
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
                width: column.fullWidth ? '100%' : undefined,
              }}
              data-cy={getID(column.header + '-column-header')}
              className="bg-lighten"
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
              zIndex: 302,
            }}
            className={props.scrollRight ? 'pf-m-border-left bg-lighten-2' : 'bg-lighten'}
            data-cy={'action-column-header'}
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
  maxSelections?: number;
  selectedItems?: T[];
  defaultExpandedRows?: boolean;
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
  const [expanded, setExpanded] = useState(!!props.defaultExpandedRows && !!expandedRowContent);
  const settings = usePageSettings();
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

  return (
    <>
      <Tr
        style={{
          boxShadow: 'unset',
          borderBottom: expanded || (props.isLastRow && disableLastRowBorder) ? 'unset' : undefined,
        }}
        data-cy={
          'id' in item && (typeof item.id === 'string' || typeof item.id === 'number')
            ? `row-id-${item.id.toString()}`
            : `row-${rowIndex}`
        }
        className={isItemSelected ? 'selected' : undefined}
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
            style={{ paddingLeft: expandedRowContent ? 8 : 4 }}
            data-cy={'expand-column-cell'}
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
                    isDisabled: maxSelections && selectedItems ? disableRow(item) : false,
                  }
                : undefined
            }
            isStickyColumn={props.scrollLeft}
            stickyMinWidth="0px"
            hasRightBorder={props.scrollLeft}
            data-cy={'checkbox-column-cell'}
            className={props.scrollLeft ? 'bg-lighten' : undefined}
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
              isDisabled: maxSelections && selectedItems ? disableRow(item) : false,
            }}
            isStickyColumn={props.scrollLeft}
            stickyMinWidth="0px"
            hasRightBorder={props.scrollLeft}
            data-cy={'checkbox-column-cell'}
            className={props.scrollLeft ? 'bg-lighten' : undefined}
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
      {expandedRow && expanded && expandedRowContent && (
        <Tr
          isExpanded={expanded}
          style={{ boxShadow: 'unset' }}
          className={isItemSelected ? 'selected' : undefined}
        >
          <Td />
          {showSelect && (
            <Th
              isStickyColumn={props.scrollLeft}
              stickyMinWidth="0px"
              hasRightBorder={props.scrollLeft}
              className={props.scrollLeft ? 'bg-lighten' : undefined}
            />
          )}
          {onSelect && <Td isStickyColumn stickyMinWidth="0px" hasRightBorder={props.scrollLeft} />}
          <Td
            colSpan={columns.length}
            style={{ paddingBottom: settings.tableLayout === 'compact' ? 12 : 24, paddingTop: 0 }}
          >
            <CollapseColumn>{expandedRowContent}</CollapseColumn>
          </Td>
          {rowActions !== undefined && rowActions.length > 0 && (
            <Td
              isActionCell
              isStickyColumn={props.scrollRight}
              stickyMinWidth="0px"
              style={{ right: 0, padding: 0, paddingRight: 0 }}
              className={props.scrollRight ? 'pf-m-border-left bg-lighten' : undefined}
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
            data-cy={getID(column.header + '-column-cell')}
          >
            <TableColumnCell item={item} column={column} />
          </Td>
        );
      })}
      {rowActions !== undefined && rowActions.length > 0 && (
        <Td
          isActionCell
          isStickyColumn={props.scrollRight}
          stickyMinWidth="0px"
          style={{
            right: 0,
            padding: 0,
            paddingRight: 8,
            zIndex: actionsExpanded ? 400 : undefined, // ZIndex 400 is needed for PF table stick headers
          }}
          data-cy={'actions-column-cell'}
          className={props.scrollRight ? 'pf-m-border-left bg-lighten' : undefined}
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

function convertString(s: string) {
  return s.toLowerCase().split(' ').join('-');
}
