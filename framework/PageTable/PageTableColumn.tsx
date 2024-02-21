import { ReactNode, useMemo } from 'react';
import { DateTimeCell } from '../PageCells/DateTimeCell';
import { LabelsCell } from '../PageCells/LabelsCell';
import { TextCell } from '../PageCells/TextCell';
import { PageTableViewTypeE } from '../PageToolbar/PageTableViewType';

/** Column options for controlling how the column displays in a table. */
export enum ColumnTableOption {
  /** Description uses the column in an expendable row with full width. */
  description = 'description',

  /** Expanded uses the column in the expendable row. */
  expanded = 'expanded',

  /** Hidden hides the column in the table. */
  hidden = 'hidden',
}

/** Column options for controlling how the column displays in a list. */
export enum ColumnListOption {
  /** Name indicates the column should show up as the name for the item in the list. */
  name = 'name',

  /** Subtitle indicates the column should show up as the subtitle under the name in the list. */
  subtitle = 'subtitle',

  /** Description indicates the column should be used as the description on the list. */
  description = 'description',

  /** Hidden hides the column in the list. */
  hidden = 'hidden',

  /** Primary places the column in the first(left) column in the list. */
  primary = 'primary',

  /** Secondary places the column in the second(right) column in the list. */
  secondary = 'secondary',
}

/** Column options for controlling how the column displays in a card. */
export enum ColumnCardOption {
  /** Name indicates the column should show up as the name for the item in the card. */
  name = 'name',

  /** Subtitle indicates the column should show up as the subtitle under the name in the card. */
  subtitle = 'subtitle',

  /** Description indicates the column should be used as the description on the card. */
  description = 'description',

  /** Hidden hides the column in the card. */
  hidden = 'hidden',
}

/** Column options for controlling how the column displays in a card. */
export enum ColumnModalOption {
  /** Hidden hides the column in modals. */
  hidden = 'hidden',
}

/** Column options for controlling how the column displays in a dashboard. */
export enum ColumnDashboardOption {
  /** Hidden hides the column in modals. */
  hidden = 'hidden',
}

/** Column options for setting column priority. This is used to determine the order in which
 * the column is displayed when generating a details page (PageDetailsFromColumns). */
export enum ColumnPriority {
  /** Last: The column data will be displayed last in PageDetailsFromColumns */
  last = 'last',
}

/** Table column common properties to all columns. */
interface ITableColumnCommon<T extends object> {
  /** Id of the column. Used to track the column in sorting and user options. */
  id?: string;

  /** Header for the column in the table. */
  header: string;

  /** MinWidth for the column. */
  minWidth?: number;

  /** MaxWidth for the column. */
  maxWidth?: number;

  /** Makes the column take up the full width */
  fullWidth?: boolean;

  /** Indicates the key for the sorting. This key is usually handled by the view to so the sorting. */
  sort?: string;

  /** Indicates the default sort direction for the column.
   * Defaults to 'asc'.
   * Dates need to default to 'desc'. Should be handled if using the DateTime column type.
   * TODO - add helper function to get default sort for a column type
   */
  defaultSortDirection?: 'asc' | 'desc';

  /** Indicates that the column is the default sorted column. */
  defaultSort?: boolean;

  /** Icon for the column. */
  // TODO need to validate that this is working in all cases and document caveats
  icon?: (item: T) => ReactNode;

  /** Table column options for controlling how the column displays in a table. */
  table?: keyof typeof ColumnTableOption;

  /** Table column options for controlling how the column displays in a list. */
  list?: keyof typeof ColumnListOption;

  /** Table column options for controlling how the column displays in a card. */
  card?: keyof typeof ColumnCardOption;

  /** Table column options for controlling how the column displays in a modal. */
  modal?: keyof typeof ColumnModalOption;

  /** Table column options for controlling how the column displays in a dashboard. */
  dashboard?: keyof typeof ColumnDashboardOption;

  /** Table column options for controlling the order in which the column's data is displayed in a details page. */
  priority?: keyof typeof ColumnPriority;
}

/** Column that renders using a render function that returns a ReactNode. */
export interface ITableColumnTypeReactNode<T extends object> extends ITableColumnCommon<T> {
  type?: undefined;
  /** if value returns undefined, this column will be hidden from expanded rows, cards, and lists. */
  value?: CellFn<T, string | string[] | number | boolean | undefined | null>;
  cell: CellFn<T, ReactNode | undefined>;
}

export interface ITableColumnTypeText<T extends object> extends ITableColumnCommon<T> {
  type: 'text';
  /** if value returns undefined, this column will be hidden from expanded rows, cards, and lists. */
  value: CellFn<T, string | null | undefined>;
  to?: (item: T) => string | undefined;
}

// TODO - default ITableColumnTypeDateTime columns maxWidth. - this will need a helper function called from the table getColumnWidth(column)
// TODO - default option table, card, list to 'description' and modal to 'hidden'. - this will need a helper function
export interface ITableColumnTypeDescription<T extends object> extends ITableColumnCommon<T> {
  type: 'description';
  /** if value returns undefined, this column will be hidden from expanded rows, cards, and lists. */
  value: CellFn<T, string | undefined | null>;
}

// TODO - default option table, card, list to 'count' and modal to 'hidden'.
export interface ITableColumnTypeCount<T extends object> extends ITableColumnCommon<T> {
  type: 'count';
  /** if value returns undefined, this column will be hidden from expanded rows, cards, and lists. */
  value: CellFn<T, number | undefined>;
  // TODO options for formatting number. i.e. should number be error/warning color if not 0?
}

/** Table column that shows a count. In a card, this shows up in a count section at the bottom of the card. */
export interface ITableColumnTypeLabels<T extends object> extends ITableColumnCommon<T> {
  type: 'labels';
  /** if value returns undefined, this column will be hidden from expanded rows, cards, and lists. */
  value: CellFn<T, string[] | undefined>;
  // TODO add use option indicating how many labels to show by default
}

// TODO - default ITableColumnTypeDateTime columns to sort 'desc'.
export interface ITableColumnTypeDateTime<T extends object> extends ITableColumnCommon<T> {
  type: 'datetime';
  /** if value returns undefined, this column will be hidden from expanded rows, cards, and lists. */
  value: CellFn<T, number | string | undefined>;
  // TODO add format to datetime & allow user to change
}

/** Table column used for rendering columns in tables, lists, and cards. */
export type ITableColumn<T extends object> =
  | ITableColumnTypeReactNode<T>
  | ITableColumnTypeText<T>
  | ITableColumnTypeDescription<T>
  | ITableColumnTypeDateTime<T>
  | ITableColumnTypeLabels<T>
  | ITableColumnTypeCount<T>;

/** Table column cell formats the cell contents based on column settings. */
export function TableColumnCell<T extends object>(props: {
  item: T;
  column?: ITableColumn<T>;
}): JSX.Element {
  const { item, column } = props;
  if (!column) return <></>;
  switch (column.type) {
    case 'text':
      return <TextCell text={column.value(item)} to={column.to?.(item)} />;
    case 'description':
      return <div style={{ minWidth: 200, whiteSpace: 'normal' }}>{column.value(item)}</div>;
    case 'datetime':
      return <DateTimeCell value={column.value(item)} />;
    case 'count':
      // TODO - handle format from column options
      return <>{column.value(item) ?? '-'}</>;
    case 'labels':
      return <LabelsCell labels={column.value(item) ?? []} />;
    default:
      return <>{column.cell(item)}</>;
  }
}

/** Hook to return only the columns that should be visible in the table. */
export function useVisibleTableColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () =>
      columns.filter((column) => {
        if (column.table === ColumnTableOption.hidden) return false;
        if (column.table === ColumnTableOption.description) return false;
        if (column.table === ColumnTableOption.expanded) return false;
        return true;
      }),
    [columns]
  );
}

/** Hook to return only the columns that should be visible in the list. */
export function useVisibleListColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () => columns.filter((column) => column.list !== ColumnListOption.hidden),
    [columns]
  );
}

/** Hook to return only the columns that should be visible in the cards. */
export function useVisibleCardColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () => columns.filter((column) => column.card !== ColumnCardOption.hidden),
    [columns]
  );
}

/** Hook to return only the columns that should be visible in a modal. */
export function useVisibleModalColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () => columns.filter((column) => column.modal !== ColumnModalOption.hidden),
    [columns]
  );
}

/** Hook to return only the columns that should be visible in a dashboard. */
export function useDashboardColumns<T extends object>(columns: ITableColumn<T>[]) {
  columns = useMemo(
    () => columns.filter((column) => column.dashboard !== ColumnDashboardOption.hidden),
    [columns]
  );
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);
  return columns;
}

/** Hook to return only the columns that should be visible in the table view type. */
export function useVisibleColumns<T extends object>(
  columns: ITableColumn<T>[],
  viewType: PageTableViewTypeE
) {
  const visibleTableColumns = useVisibleTableColumns(columns);
  const visibleListColumns = useVisibleListColumns(columns);
  const visibleCardColumns = useVisibleCardColumns(columns);
  switch (viewType) {
    case PageTableViewTypeE.Table:
      return visibleTableColumns;
    case PageTableViewTypeE.List:
      return visibleListColumns;
    case PageTableViewTypeE.Cards:
      return visibleCardColumns;
  }
}

/** Hook to return only the columns that should be visible in a table expanded row as description. */
export function useDescriptionColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () =>
      columns.filter((column) => {
        if (column.table === ColumnTableOption.hidden) return false;
        if (column.table === ColumnTableOption.description) return true;
        return false;
      }),
    [columns]
  );
}

/** Hook to return only the columns that should be visible in a table expanded row. */
export function useExpandedColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () =>
      columns.filter((column) => {
        if (column.table === ColumnTableOption.hidden) return false;
        if (column.table === ColumnTableOption.expanded) return true;
        return false;
      }),
    [columns]
  );
}

type CellFn<T extends object, R> = (item: T) => R;

/** Hook to disable sorting on all columns. */
export function useColumnsWithoutSort<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(() => columns.map((column) => ({ ...column, sort: undefined })), [columns]);
}

/** Hook to disable sorting on all columns. */
export function useColumnsWithoutExpandedRow<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        table: column.table === ColumnTableOption.expanded ? undefined : column.table,
      })),
    [columns]
  );
}
