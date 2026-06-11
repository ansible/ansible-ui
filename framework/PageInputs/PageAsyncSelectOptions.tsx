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
