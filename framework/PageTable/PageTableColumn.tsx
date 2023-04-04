import { ReactNode } from 'react';
import { SinceCell } from '../PageCells/DateTimeCell';
import { LabelsCell } from '../PageCells/LabelsCell';
import { TextCell } from '../PageCells/TextCell';

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

  icon?: (item: T) => ReactNode;
  card?: 'name' | 'subtitle' | 'description' | 'hidden';
  list?: 'name' | 'subtitle' | 'description' | 'hidden' | 'primary' | 'secondary';
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
  value: CellFn<T, string | null | undefined>;
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
