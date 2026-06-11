/**
 * Interface for EDA API responses that return a list of items.
 */
export interface EdaItemsResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}
