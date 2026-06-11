export interface EdaResult<T> {
  count: number;
  next?: string;
  page?: number;
  page_size?: 20;
  previous?: string;
  results?: T[];
}
