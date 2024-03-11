import { PageSelectOption } from './PageSelectOption';

export interface PageAsyncSelectQueryResult<ValueT> {
  total: number;
  options: PageSelectOption<ValueT>[];
}

export type PageAsyncSelectOptionsFn<ValueT> = (
  page: number,
  signal: AbortSignal
) => Promise<PageAsyncSelectQueryResult<ValueT>>;

/** The placeholder to show if the query fails. */
export type PageAsyncQueryErrorText = string | ((error: Error) => string);
