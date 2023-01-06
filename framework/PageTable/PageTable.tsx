import {
  Bullseye,
  Button,
  DropdownPosition,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  PageSection,
  Skeleton,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';
import {
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
  useRef,
  useState,
} from 'react';
import { Scrollable } from '../components/Scrollable';
import { useBreakpoint } from '../components/useBreakPoint';
import { IPageAction } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { PageActionType } from '../PageActions/PageActionType';
import { PageBody } from '../PageBody';
import { SinceCell } from '../PageCells/DateTimeCell';
import { LabelsCell } from '../PageCells/LabelsCell';
import { TextCell } from '../PageCells/TextCell';
import { useColumnModal } from '../PageColumnModal';
import { useSettings } from '../Settings';
import { PagePagination } from './PagePagination';
import { PageTableCards } from './PageTableCards';
import { PageTableList } from './PageTableList';
import { PageTableViewType, PageTableViewTypeE } from './PageTableViewType';
import { IToolbarFilter, PageTableToolbar } from './PageToolbar';

export type PageTableProps<T extends object> = {
  keyFn: (item: T) => string | number;

  itemCount?: number;
  pageItems: T[] | undefined;

  toolbarActions?: IPageAction<T>[];

  tableColumns: ITableColumn<T>[];

  rowActions?: IPageAction<T>[];

  toolbarFilters?: IToolbarFilter[];
  filters?: Record<string, string[]>;
  setFilters?: Dispatch<SetStateAction<Record<string, string[]>>>;
  clearAllFilters?: () => void;

  sort?: string;
  setSort?: (sort: string) => void;
  sortDirection?: 'asc' | 'desc';
  setSortDirection?: (sortDirection: 'asc' | 'desc') => void;
  compact?: boolean;

  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  autoHidePagination?: boolean;

  isSelected?: (item: T) => boolean;
  selectedItems?: T[];
  selectItem?: (item: T) => void;
  unselectItem?: (item: T) => void;
  selectItems?: (items: T[]) => void;
  unselectAll?: () => void;
  onSelect?: (item: T) => void;
  selectNoneText?: string;

  errorStateTitle: string;
  error?: Error;

  emptyStateTitle: string;
  emptyStateDescription?: string;
  emptyStateButtonText?: string;
  emptyStateButtonClick?: () => void;

  t?: (t: string) => string;

  showSelect?: boolean;

  disableTableView?: boolean;
  disableListView?: boolean;
  disableCardView?: boolean;

  defaultTableView?: PageTableViewType;

  disableBodyPadding?: boolean;

  defaultSubtitle?: ReactNode;
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
  // const { disableBodyPadding } = props
  const { toolbarActions, filters, error, itemCount } = props;
  const { openColumnModal, columnModal, managedColumns } = useColumnModal(props.tableColumns);
  const showSelect =
    toolbarActions?.find((toolbarAction) => PageActionType.bulk === toolbarAction.type) !==
    undefined;

  const hasTableViewType = !props.disableTableView;
  const hasListViewType = !props.disableListView;
  // const hasCardViewType = !props.disableCardView

  const [viewType, setViewType] = useState<PageTableViewType>(
    () =>
      props.defaultTableView ??
      (hasTableViewType
        ? PageTableViewTypeE.Table
        : hasListViewType
        ? PageTableViewTypeE.List
        : PageTableViewTypeE.Cards)
  );

  const settings = useSettings();

  const usePadding = useBreakpoint('md') && props.disableBodyPadding !== true;

  if (error) {
    return (
      <div
        style={{
          backgroundColor:
            settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
          height: '100%',
        }}
      >
        <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 48 }}>
          <EmptyStateIcon
            icon={ExclamationCircleIcon}
            color="var(--pf-global--danger-color--100)"
          />
          <Title headingLevel="h2" size="lg">
            {/* Unable to connect */}
            {props.errorStateTitle}
          </Title>
          {/* <EmptyStateBody>There was an error retrieving data. Check your connection and reload the page.</EmptyStateBody> */}
          <EmptyStateBody>{error.message}</EmptyStateBody>
        </EmptyState>
      </div>
    );
  }

  if (itemCount === 0 && Object.keys(filters ?? {}).length === 0) {
    return (
      <PageSection>
        <EmptyState variant={EmptyStateVariant.large} style={{ paddingTop: 48 }}>
          <EmptyStateIcon icon={PlusCircleIcon} />
          <Title headingLevel="h4" size="lg">
            {props.emptyStateTitle}
          </Title>
          {props.emptyStateDescription && (
            <EmptyStateBody>{props.emptyStateDescription}</EmptyStateBody>
          )}
          {props.emptyStateButtonClick && (
            <Button variant="primary" onClick={props.emptyStateButtonClick}>
              {props.emptyStateButtonText}
            </Button>
          )}
        </EmptyState>
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

  return (
    <>
      <PageTableToolbar
        {...props}
        openColumnModal={openColumnModal}
        showSelect={showSelect}
        viewType={viewType}
        setViewType={setViewType}
      />
      {viewType === PageTableViewTypeE.Table && (
        <PageBody disablePadding>
          <PageTableView {...props} tableColumns={managedColumns} />
        </PageBody>
      )}
      {viewType === PageTableViewTypeE.List && (
        <Scrollable>
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
              <PageTableList {...props} showSelect={showSelect} />
            </div>
          </PageSection>
        </Scrollable>
      )}
      {viewType === PageTableViewTypeE.Cards && (
        <Scrollable>
          <PageTableCards {...props} showSelect={showSelect} />
        </Scrollable>
      )}
      {(!props.autoHidePagination || (props.itemCount ?? 0) > props.perPage) && (
        <PagePagination {...props} />
      )}
      {columnModal}
    </>
  );
}

function PageTableView<T extends object>(props: PageTableProps<T>) {
  const {
    tableColumns,
    pageItems,
    selectItem,
    unselectItem,
    isSelected,
    keyFn,
    rowActions,
    toolbarActions,
    itemCount,
    perPage,
    clearAllFilters,
    onSelect,
    unselectAll,
  } = props;
  let { t } = props;
  t = t ? t : (t: string) => t;
  const showSelect =
    props.showSelect ||
    toolbarActions?.find((toolbarAction) => PageActionType.bulk === toolbarAction.type) !==
      undefined;
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

  return (
    <div
      className="pf-c-scroll-inner-wrapper"
      style={{ height: '100%', marginBottom: -1 }}
      ref={containerRef}
      onScroll={onScroll}
    >
      <TableComposable
        aria-label="Simple table"
        variant={
          props.compact ? 'compact' : settings.tableLayout === 'compact' ? 'compact' : undefined
        }
        gridBreakPoint=""
        isStickyHeader
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
          />
        )}
        <Tbody>
          {itemCount === undefined
            ? new Array(perPage).fill(0).map((_, index) => (
                <Tr key={index}>
                  <Td>
                    <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                      <Skeleton height="27px" />
                    </div>
                  </Td>
                </Tr>
              ))
            : pageItems === undefined
            ? new Array(Math.min(perPage, itemCount)).fill(0).map((_, index) => (
                <Tr key={index}>
                  {showSelect && <Td></Td>}
                  <Td colSpan={tableColumns.length}>
                    <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                      <Skeleton height="27px" />
                    </div>
                  </Td>
                </Tr>
              ))
            : pageItems?.map((item, rowIndex) => (
                <TableRow<T>
                  key={keyFn ? keyFn(item) : rowIndex}
                  columns={tableColumns}
                  item={item}
                  isItemSelected={isSelected?.(item)}
                  selectItem={selectItem}
                  unselectItem={unselectItem}
                  rowActions={rowActions}
                  rowIndex={rowIndex}
                  showSelect={showSelect}
                  scrollLeft={scroll.left > 0}
                  scrollRight={scroll.right > 1}
                  unselectAll={unselectAll}
                  onSelect={onSelect}
                />
              ))}
        </Tbody>
      </TableComposable>
      {itemCount === 0 && (
        <EmptyState style={{ paddingTop: 48 }}>
          <EmptyStateIcon icon={SearchIcon} />
          <Title headingLevel="h2" size="lg">
            {t('No results found')}
          </Title>
          <EmptyStateBody>
            {t('No results match this filter criteria. Adjust your filters and try again.')}
          </EmptyStateBody>
          {clearAllFilters && (
            <EmptyStateSecondaryActions>
              <Button variant="link" onClick={clearAllFilters}>
                {t('Clear all filters')}
              </Button>
            </EmptyStateSecondaryActions>
          )}
        </EmptyState>
      )}
    </div>
  );
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
  } = props;
  const settings = useSettings();

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
      <Tr>
        {(showSelect || onSelect) && (
          <Th
            isStickyColumn
            style={{
              width: '0%',
              backgroundColor:
                settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
            }}
            stickyMinWidth="45px"
            hasRightBorder={props.scrollLeft}
          >
            &nbsp;
          </Th>
        )}
        {columns
          .filter((column) => column.enabled !== false)
          .map((column, index) => {
            return (
              <Th
                modifier="fitContent"
                key={column.header}
                style={{
                  minWidth: column.minWidth ?? 0,
                  maxWidth: column.maxWidth,
                  backgroundColor:
                    settings.theme === 'dark'
                      ? 'var(--pf-global--BackgroundColor--300)'
                      : undefined,
                  width: column.isIdColumn ? '0%' : undefined,
                }}
                sort={getColumnSort(index, column)}
              >
                {column.header}
              </Th>
            );
          })}
        {itemActions !== undefined && (
          <Th
            style={{
              paddingRight: 8,
              paddingLeft: 0,
              width: '0%',
              right: 0,
              backgroundColor:
                settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
            }}
            isStickyColumn
            stickyMinWidth="45px"
            className={props.scrollRight ? 'pf-m-border-left' : undefined}
          >
            &nbsp;
          </Th>
        )}
      </Tr>
    </Thead>
  );
}

function TableRow<T extends object>(props: {
  columns: ITableColumn<T>[];
  item: T;
  isItemSelected?: boolean;
  selectItem?: (item: T) => void;
  unselectItem?: (item: T) => void;
  rowActions?: IPageAction<T>[];
  rowIndex: number;
  showSelect: boolean;
  scrollLeft?: boolean;
  scrollRight?: boolean;
  onSelect?: (item: T) => void;
  unselectAll?: () => void;
}) {
  const {
    columns,
    selectItem,
    unselectItem,
    unselectAll,
    isItemSelected,
    item,
    rowActions,
    rowIndex,
    showSelect,
    onSelect,
  } = props;
  const md = useBreakpoint('xl');
  return (
    <Tr
      className={isItemSelected ? 'selected' : undefined}
      // style={{ backgroundColor: theme === ThemeE.Dark ? 'transparent' : undefined }}
      isRowSelected={isItemSelected}
      style={{ boxShadow: 'unset' }}
      // isStriped={rowIndex % 2 === 0}
    >
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
          style={{ width: '0%', paddingLeft: md ? undefined : 20, paddingRight: 16 }}
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
              unselectAll?.();
              selectItem?.(item);
              onSelect?.(item);
            },
            isSelected: isItemSelected ?? false,
            // disable: !isRepoSelectable(repo),
            variant: 'radio',
          }}
          style={{
            width: '0%',
            paddingLeft: md ? undefined : 20,
            position: 'sticky',
            left: 0,
            background: 'var(--pf-c-table__sticky-column--BackgroundColor)',
            zIndex: 1,
          }}
        />
      )}
      <TableCells
        rowIndex={rowIndex}
        columns={columns}
        item={item}
        rowActions={rowActions}
        scrollLeft={props.scrollLeft}
        scrollRight={props.scrollRight}
      />
    </Tr>
  );
}

function TableCells<T extends object>(props: {
  rowIndex: number;
  columns: ITableColumn<T>[];
  item: T;
  rowActions?: IPageAction<T>[];
  scrollLeft?: boolean;
  scrollRight?: boolean;
}) {
  const { columns, item, rowActions, rowIndex } = props;
  return (
    <Fragment>
      {columns
        .filter((column) => column.enabled !== false)
        .map((column) => {
          return (
            <Td key={column.header} dataLabel={column.header} modifier="nowrap">
              <TableColumnCell item={item} column={column} />
            </Td>
          );
        })}
      {rowActions !== undefined && rowActions.length > 0 && (
        <Th
          style={{
            zIndex: 100 - rowIndex,
            paddingRight: 8,
            paddingLeft: 8,
            width: '0%',
            right: 0,
          }}
          isStickyColumn
          stickyMinWidth="0px"
          className={props.scrollRight ? 'pf-m-border-left' : undefined}
        >
          <PageActions
            actions={rowActions}
            selectedItem={item}
            position={DropdownPosition.right}
            iconOnly
          />
        </Th>
      )}
    </Fragment>
  );
}

type CellFn<T extends object, R> = (item: T) => R;

export interface ITableColumnCommon<T extends object> {
  id?: string;
  header: string;
  minWidth?: number;
  maxWidth?: number;
  enabled?: boolean;
  isIdColumn?: boolean;

  sort?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultSort?: boolean;

  // card?: 'description' | 'hidden' | 'count'

  // list?: 'primary' | 'secondary'

  // hideLabel?: boolean

  // primary?: boolean

  icon?: (item: T) => ReactNode;
  card?: 'name' | 'subtitle' | 'description' | 'hidden';
  list?: 'name' | 'subtitle' | 'description' | 'hidden' | 'primary' | 'secondary';
}

export enum TableColumnSomething {
  'id',
  'name',
  'description',
}

export enum TableColumnCardType {
  'description',
  'hidden',
  'count',
}

export interface ITableColumnTypeReactNode<T extends object> extends ITableColumnCommon<T> {
  type?: undefined;
  value?: CellFn<T, string | string[] | number | boolean>;
  cell: CellFn<T, ReactNode | undefined>;
}

export interface ITableColumnTypeCount<T extends object> extends ITableColumnCommon<T> {
  type: 'count';
  value: CellFn<T, number | undefined>;
}

export interface ITableColumnTypeLabels<T extends object> extends ITableColumnCommon<T> {
  type: 'labels';
  value: CellFn<T, string[] | undefined>;
}

export interface ITableColumnTypeDateTime<T extends object> extends ITableColumnCommon<T> {
  type: 'datetime';
  value: CellFn<T, number | string | undefined>;
}

export interface ITableColumnTypeDescription<T extends object> extends ITableColumnCommon<T> {
  type: 'description';
  value: CellFn<T, string | undefined | null>;
}

export interface ITableColumnTypeText<T extends object> extends ITableColumnCommon<T> {
  type: 'text';
  value: CellFn<T, string | undefined>;
}

export type ITableColumn<T extends object> =
  | ITableColumnTypeReactNode<T>
  | ITableColumnTypeDateTime<T>
  | ITableColumnTypeLabels<T>
  | ITableColumnTypeCount<T>
  | ITableColumnTypeText<T>
  | ITableColumnTypeDescription<T>;

export function TableColumnCell<T extends object>(props: { item: T; column?: ITableColumn<T> }) {
  const { item, column } = props;
  if (!column) return <></>;
  switch (column.type) {
    case 'text':
      return <TextCell text={column.value(item)} />;
    case 'labels':
      return <LabelsCell labels={column.value(item) ?? []} />;
    case 'description':
      return <TextCell text={column.value(item)} />;
    case 'count':
      return <>{column.value(item) ?? '-'}</>;
    case 'datetime':
      return <SinceCell value={column.value(item)} />;
    default:
      return <>{column.cell(item)}</>;
  }
}
