import { describe, expect, it } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { extractErrorDescription, isAccessDeniedError } from './errorUtils';

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

describe('extractErrorDescription', () => {
  it('should return Error.message for a non-RequestError', () => {
    expect(extractErrorDescription(new Error('something broke'))).toBe('something broke');
  });

  it('should extract Galaxy-style errors array', () => {
    const json = { errors: [{ detail: 'Collection not found', title: 'Not Found' }] };
    const error = new RequestError('Not Found', undefined, 404, json, json);
    expect(extractErrorDescription(error)).toBe('Error 404 - Not Found: Collection not found');
  });

  it('should extract Pulp-style detail string', () => {
    const json = { detail: 'Remote not configured' };
    const error = new RequestError('Bad Request', undefined, 400, json, json);
    expect(extractErrorDescription(error)).toBe('Error 400 - Bad Request: Remote not configured');
  });

  it('should extract Django REST non_field_errors', () => {
    const json = { non_field_errors: ['Invalid input', 'Duplicate entry'] };
    const error = new RequestError('Bad Request', undefined, 400, json, json);
    expect(extractErrorDescription(error)).toBe(
      'Error 400 - Bad Request: Invalid input Duplicate entry'
    );
  });

  it('should fall back to stringifying values for unknown error shapes', () => {
    const json = { name: ['This field is required.'], url: ['Enter a valid URL.'] };
    const error = new RequestError('Bad Request', undefined, 400, json, json);
    expect(extractErrorDescription(error)).toBe(
      'Error 400 - Bad Request: This field is required. Enter a valid URL.'
    );
  });

  it('should return only the prefix when detail is empty', () => {
    const json = { errors: [] };
    const error = new RequestError('Bad Request', undefined, 400, json, json);
    expect(extractErrorDescription(error)).toBe('Error 400 - Bad Request');
  });
});
