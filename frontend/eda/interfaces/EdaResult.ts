export interface EdaResult<T> {
  count: number;
  next?: string;
  page?: number;
  page_size?: number;
  previous?: string;
  results?: T[];
}
