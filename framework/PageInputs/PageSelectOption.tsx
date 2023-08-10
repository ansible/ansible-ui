export interface IPageSelectOption<ValueT> {
  key?: string | number; // If not provided, will items will be tracked by label
  value: ValueT;
  label: string;
  description?: string;
}

/**
 * A PageSelectOption is a string, number, or an object with the following properties:
 * - key?: string | number; // If not provided, will items will be tracked by label
 * - value: ValueT;
 * - label: string;
 * - description?: string;
 */
export type PageSelectOption<ValueT = unknown> = string | number | IPageSelectOption<ValueT>;

export function getPageSelectOptions<ValueT>(
  options: PageSelectOption<ValueT>[]
): IPageSelectOption<ValueT>[] {
  return options.map((option) => {
    switch (typeof option) {
      case 'string':
        return {
          key: option,
          value: option,
          label: option,
        };
      case 'number':
        return {
          key: option,
          value: option,
          label: option.toString(),
        };
      default:
        return {
          key: option.key !== undefined ? option.key : option.label,
          value: option.value,
          label: option.label,
          description: option.description,
        };
    }
  }) as IPageSelectOption<ValueT>[];
}
