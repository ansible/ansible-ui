export interface MockResponse {
  status?: number;
  body?: object;
  headers?: Record<string, string>;
}
