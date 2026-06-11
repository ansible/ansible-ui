import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import { edaErrorAdapter, useEdaErrorMessageParser } from './edaErrorAdapter';

describe('edaErrorAdapter', () => {
  it('should return empty arrays when passed an empty object', () => {
    const error = new RequestError('Some Error', undefined, 400, {}, {});
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors.length).toBe(0);
  });

  it('should return empty arrays when passed an Error instance', () => {
    const error = new Error('Something went wrong');
    const result = edaErrorAdapter(error);
    expect(result.genericErrors).toEqual([{ message: 'Something went wrong' }]);
    expect(result.fieldErrors.length).toBe(0);
  });

  it('should return field errors when passed a RequestError instance with JSON data', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      {
        name: ['Name is required'],
        email: ['Email is invalid'],
      }
    );
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors).toEqual([
      { name: 'name', message: 'Name is required' },
      { name: 'email', message: 'Email is invalid' },
    ]);
  });

  it('should return the field errors', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { name: ['activation with this name already exists.'] }
    );
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors).toEqual([
      { name: 'name', message: 'activation with this name already exists.' },
    ]);
  });

  it('should handle "detail" errors as generic errors', () => {
    const error = new RequestError('Validation failed', undefined, 400, {}, { detail: 'Error' });
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).toBe(1);
    expect(result.fieldErrors.length).toBe(0);
    expect(result.genericErrors).toEqual([{ message: 'Error' }]);
  });

  it('should deal with "errors" errors as generic errors', () => {
    const error = new RequestError(
      'Errors',
      undefined,
      400,
      {},
      { non_field_errors: ['Generic non-field error'] }
    );
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).toBe(1);
    expect(result.fieldErrors.length).toBe(0);
    expect(result.genericErrors).toEqual([{ message: 'Generic non-field error' }]);
  });
});

describe('useEdaErrorMessageParser', () => {
  it('should return a message and parsedErrors', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { name: ['Name is required'] }
    );
    const parseError = useEdaErrorMessageParser();
    const result = parseError(error);
    expect(result.message).toBe('Name is required');
    expect(result.parsedErrors).toEqual([{ message: 'Name is required' }]);
  });
});
