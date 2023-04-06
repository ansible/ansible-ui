import { ReactNode, useMemo } from 'react';
import { DateTimeCell } from '../PageCells/DateTimeCell';
import { LabelsCell } from '../PageCells/LabelsCell';
import { TextCell } from '../PageCells/TextCell';

/** Column options for controlling how the column displays in a table. */
export enum ColumnTableOption {
  /** Key indicates the column is the key for the item and should not be allowed to be hidden by the user. */
  Key = 'key',

  /** Description uses the column in an expendable row with full width. */
  Description = 'description',

  /** Expanded uses the column in an expendable row. */
  Expanded = 'expanded',

  /** Hidden hides the column in the table. */
  Hidden = 'hidden',

  /** Id shows the row as an ID with a collapsed width so the ID shows by the name. */
  Id = 'id',
}

/** Column options for controlling how the column displays in a list. */
export enum ColumnListOption {
  /** Name indicates the column should show up as the name for the item in the list. */
  Name = 'name',

  /** Subtitle indicates the column should show up as the subtitle under the name in the list. */
  Subtitle = 'subtitle',

  /** Description indicates the column should be used as the description on the list. */
  Description = 'description',

  /** Hidden hides the column in the list. */
  Hidden = 'hidden',

  /** Primary places the column in the first(left) column in the list. */
  Primary = 'primary',

  /** Secondary places the column in the second(right) column in the list. */
  Secondary = 'secondary',
}

/** Column options for controlling how the column displays in a card. */
export enum ColumnCardOption {
  /** Name indicates the column should show up as the name for the item in the card. */
  Name = 'name',

  /** Subtitle indicates the column should show up as the subtitle under the name in the card. */
  Subtitle = 'subtitle',

  /** Description indicates the column should be used as the description on the card. */
  Description = 'description',

  /** Hidden hides the column in the card. */
  Hidden = 'hidden',
}

/** Column options for controlling how the column displays in a card. */
export enum ColumnModalOption {
  /** Hidden hides the column in modals. */
  Hidden = 'hidden',
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

  /**
   * Indicates if the column is enabled in the table.
   * @deprecated Use the 'table' options field with 'hidden'
   */
  enabled?: boolean;

  /**
   * Indicates if the column is the id column in the table.
   * @deprecated Use the 'table' options field with 'id'
   */
  isIdColumn?: boolean;

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
  icon?: (item: T) => ReactNode;

  /** Table column options for controlling how the column displays in a table. */
  table?: ColumnTableOption;

  /** Table column options for controlling how the column displays in a list. */
  list?: 'name' | 'subtitle' | 'description' | 'hidden' | 'primary' | 'secondary';
  // TODO update to ColumnListOption - will be a lot of changes - will need to be its own PR

  /** Table column options for controlling how the column displays in a card. */
  card?: 'name' | 'subtitle' | 'description' | 'hidden';
  // TODO update to ColumnCardOption - will be a lot of changes - will need to be its own PR

  /** Table column options for controlling how the column displays in a modal. */
  modal?: ColumnModalOption;
}

//** Column that renders using a render function that returns a ReactNode. */
export interface ITableColumnTypeReactNode<T extends object> extends ITableColumnCommon<T> {
  type?: undefined;
  value?: CellFn<T, string | string[] | number | boolean>;
  cell: CellFn<T, ReactNode | undefined>;
}

export interface ITableColumnTypeText<T extends object> extends ITableColumnCommon<T> {
  type: 'text';
  value: CellFn<T, string | null | undefined>;
}

// TODO - default ITableColumnTypeDateTime columns maxWidth. - this will need a helper function called from the table getColumnWidth(column)
// TODO - default option table, card, list to 'description' and modal to 'hidden'. - this will need a helper function
export interface ITableColumnTypeDescription<T extends object> extends ITableColumnCommon<T> {
  type: 'description';
  value: CellFn<T, string | undefined | null>;
}

// TODO - default option table, card, list to 'count' and modal to 'hidden'.
export interface ITableColumnTypeCount<T extends object> extends ITableColumnCommon<T> {
  type: 'count';
  value: CellFn<T, number | undefined>;
  // TODO options for formatting number. i.e. should number be error/warning color if not 0?
}

/** Table column that shows a count. In a card, this shows up in a count section at the bottom of the card. */
export interface ITableColumnTypeLabels<T extends object> extends ITableColumnCommon<T> {
  type: 'labels';
  value: CellFn<T, string[] | undefined>;
  // TODO add use option indicating how many labels to show by default
}

// TODO - default ITableColumnTypeDateTime columns to sort 'desc'.
export interface ITableColumnTypeDateTime<T extends object> extends ITableColumnCommon<T> {
  type: 'datetime';
  value: CellFn<T, number | string | undefined>;
  // TODO add format to datetime & allow user to change
}

/** Table column used for rednering columns in tables, lists, and cards. */
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
      return <TextCell text={column.value(item)} />;
    case 'description':
      return <TextCell text={column.value(item)} />;
    case 'datetime':
      // TODO - handle format from column options
      return <DateTimeCell format="since" value={column.value(item)} />;
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
export function useVisibleTableColumns<T extends object>(
  columns: ITableColumn<T>[],

  /** Indicates if the columns should be filtered for the expanded row. */
  expandedRow?: boolean
) {
  return useMemo(
    () =>
      columns.filter((column) => {
        if (column.table === ColumnTableOption.Hidden) return false;
        if (expandedRow && column.table === ColumnTableOption.Expanded) return true;
        if (!expandedRow && column.table === ColumnTableOption.Expanded) return false;
        return true;
      }),
    [columns, expandedRow]
  );
}

/** Hook to return only the columns that should be visible in the list. */
export function useVisibleListColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () => columns.filter((column) => column.list !== ColumnListOption.Hidden),
    [columns]
  );
}

/** Hook to return only the columns that should be visible in the cards. */
export function useVisibleCardColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () => columns.filter((column) => column.card !== ColumnCardOption.Hidden),
    [columns]
  );
}

/** Hook to return only the columns that should be visible in a modal. */
export function useVisibleModalColumns<T extends object>(columns: ITableColumn<T>[]) {
  return useMemo(
    () => columns.filter((column) => column.modal !== ColumnModalOption.Hidden),
    [columns]
  );
}

type CellFn<T extends object, R> = (item: T) => R;
