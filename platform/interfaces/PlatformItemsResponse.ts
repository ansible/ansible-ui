/**
 * Interface for API responses that return a list of items.
 */
export interface PlatformItemsResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}
