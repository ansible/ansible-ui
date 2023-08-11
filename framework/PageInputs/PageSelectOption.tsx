export interface PageSelectOption<ValueT> {
  key?: string | number; // If not provided, will items will be tracked by label
  value: ValueT;
  label: string;
  description?: string;
}
