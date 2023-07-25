/**
 * Interface for AWX API responses that return a list of items.
 */
export interface AwxItemsResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}
