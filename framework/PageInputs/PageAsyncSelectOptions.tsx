import { PageSelectOption } from './PageSelectOption';

/** The function to query for a page of options. */
export type PageAsyncSelectOptionsFn<ValueT> = (
  queryOptions: PageAsyncSelectQueryOptions
) => Promise<PageAsyncSelectQueryResult<ValueT>>;

export interface PageAsyncSelectQueryOptions {
  /**
   * Cursor from the query to indicate the next query.
   * Undefined indicates the first query.
   * Could me the next page number or a string to indicate the next cursor.
   */
  next?: string | number;

  /** String indicating the search term for the query. */
  search?: string;

  /** The signal to abort the query. Used when search term is changed. */
  signal: AbortSignal;
}

/** The result of a query for a page of options. */
export interface PageAsyncSelectQueryResult<ValueT> {
  /** The remaining number of available options that can be queried. */
  remaining: number;

  /**
   * The options to show in the select.
   * Return empty array to indicate no more options available.
   */
  options: PageSelectOption<ValueT>[];

  /**
   * The cursor to indicate the next query.
   * Passed to the `next` parameter of the query function when getting more options.
   */
  next: string | number;
}

/** The placeholder to show if the query fails. */
export type PageAsyncQueryErrorText = string | ((error: Error) => string);

function comparePageSelectOptions<ValueT>(
  first: PageSelectOption<ValueT>,
  second: PageSelectOption<ValueT>
): number {
  const lhs = first.label.toLowerCase();
  const rhs = second.label.toLowerCase();
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}

export function mergePageSelectOptions<ValueT>(
  previousOptions: PageSelectOption<ValueT>[] | null | undefined,
  nextOptions: PageSelectOption<ValueT>[],
  shouldSort: boolean
): PageSelectOption<ValueT>[] {
  const uniqueValues = new Set<ValueT>();
  const mergedOptions = [...(previousOptions ?? []), ...nextOptions].filter((option) => {
    if (uniqueValues.has(option.value)) return false;
    uniqueValues.add(option.value);
    return true;
  });
  if (shouldSort) mergedOptions.sort(comparePageSelectOptions);
  return mergedOptions;
}

export function deferPageSelect<ValueT>(
  onSelect: (value: ValueT | null) => void,
  value: ValueT,
  signal?: AbortSignal
) {
  const timeoutId = setTimeout(() => {
    if (signal?.aborted) return;
    onSelect(value);
  }, 0);
  const cancel = () => clearTimeout(timeoutId);
  signal?.addEventListener('abort', cancel, { once: true });
  return cancel;
}
