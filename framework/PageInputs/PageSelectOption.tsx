import { ReactNode } from 'react';

export interface PageSelectOption<ValueT> {
  key?: string | number; // If not provided, will items will be tracked by label
  value: ValueT;
  icon?: ReactNode;
  label: string;
  description?: ReactNode;
  group?: string;
}
