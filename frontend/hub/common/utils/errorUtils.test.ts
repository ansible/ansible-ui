import { describe, expect, it } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { isAccessDeniedError } from './errorUtils';

describe('isAccessDeniedError', () => {
  it('should return false for undefined error', () => {
    expect(isAccessDeniedError(undefined)).toBe(false);
  });

  it('should return true for RequestError with 403 status code', () => {
    const error = new RequestError('Forbidden', 'Access denied', 403, undefined, undefined);
    expect(isAccessDeniedError(error)).toBe(true);
  });

  it('should return false for RequestError with 401 status code', () => {
    const error = new RequestError('Unauthorized', 'Not authenticated', 401, undefined, undefined);
    expect(isAccessDeniedError(error)).toBe(false);
  });

  it('should return false for RequestError with 404 status code', () => {
    const error = new RequestError('Not Found', 'Resource not found', 404, undefined, undefined);
    expect(isAccessDeniedError(error)).toBe(false);
  });

  it('should return false for RequestError with 500 status code', () => {
    const error = new RequestError(
      'Internal Server Error',
      'Something went wrong',
      500,
      undefined,
      undefined
    );
    expect(isAccessDeniedError(error)).toBe(false);
  });

  it('should return true for Error with "forbidden" in message', () => {
    const error = new Error('Request failed: Forbidden');
    expect(isAccessDeniedError(error)).toBe(true);
  });

  it('should return true for Error with "Forbidden" (case insensitive) in message', () => {
    const error = new Error('FORBIDDEN access');
    expect(isAccessDeniedError(error)).toBe(true);
  });

  it('should return true for Error with "403" in message', () => {
    const error = new Error('Error 403: Access not allowed');
    expect(isAccessDeniedError(error)).toBe(true);
  });

  it('should return false for regular Error without 403 indicators', () => {
    const error = new Error('Something went wrong');
    expect(isAccessDeniedError(error)).toBe(false);
  });

  it('should return false for Error with empty message', () => {
    const error = new Error('');
    expect(isAccessDeniedError(error)).toBe(false);
  });
});
