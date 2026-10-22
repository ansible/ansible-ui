import { isRequestError } from '../../../../common/crud/RequestError';

/**
 * HTTP statuses of a request the server rejects as too large: 431 (request header fields too
 * large, also for a long URL behind HTTP/2 proxies), 414 (URI too long) and 413 (the body of a
 * report query is too large, e.g. for a huge selection of explicit values).
 */
const REQUEST_TOO_LARGE_STATUS_CODES = new Set([413, 414, 431]);

/** Whether the HTTP status is one of a request the server rejects as too large. */
export function isRequestTooLargeStatus(statusCode: number) {
  return REQUEST_TOO_LARGE_STATUS_CODES.has(statusCode);
}

/** Whether the server rejected the request as too large, e.g. because of too many filter values. */
export function isRequestTooLargeError(error: unknown) {
  return isRequestError(error) && isRequestTooLargeStatus(error.statusCode);
}

/** SWR `shouldRetryOnError`: a request rejected as too large fails again, so it is not retried. */
export function shouldRetryUnlessTooLarge(error: unknown) {
  return !isRequestTooLargeError(error);
}
