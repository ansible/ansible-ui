import { describe, expect, it } from 'vitest';
import { RequestError } from '../../../../common/crud/RequestError';
import { isRequestTooLargeError } from './requestTooLarge';

function requestError(statusCode: number) {
  return new RequestError('Request failed', undefined, statusCode, undefined, undefined);
}

describe('isRequestTooLargeError', () => {
  it.each([431, 414])('is true for a %s response', (statusCode) => {
    expect(isRequestTooLargeError(requestError(statusCode))).toBe(true);
  });

  it('is false for other errors', () => {
    expect(isRequestTooLargeError(requestError(400))).toBe(false);
    expect(isRequestTooLargeError(new Error('Network error'))).toBe(false);
    expect(isRequestTooLargeError(undefined)).toBe(false);
  });
});
