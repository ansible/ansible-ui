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

  it('should handle inputs as generic errors when it is an array of strings', () => {
    const error = new RequestError('Input error', undefined, 400, {}, { inputs: ['Error'] });
    const result = edaErrorAdapter(error);
    expect(result.genericErrors).toEqual([{ message: 'Error' }]);
    expect(result.fieldErrors.length).toBe(0);
  });

  it('should map nested credential inputs to inputs.<field> form field names', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      {
        inputs: {
          aws_access_key: [
            "This field can't include HTML tags, script markup, or unsafe URI schemes.",
          ],
        },
      }
    );
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors).toEqual([
      {
        name: 'inputs.aws_access_key',
        message: "This field can't include HTML tags, script markup, or unsafe URI schemes.",
      },
    ]);
  });

  it('should handle inputs as field errors when values are strings', () => {
    const error = new RequestError(
      'Input error',
      undefined,
      400,
      {},
      { inputs: { host: 'Host is required' } }
    );
    const result = edaErrorAdapter(error);
    expect(result.fieldErrors).toEqual([{ name: 'inputs.host', message: 'Host is required' }]);
  });

  it('should flatten arbitrarily nested field errors', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { config: { timeout: ['Must be positive'] } }
    );
    const result = edaErrorAdapter(error);
    expect(result.fieldErrors).toEqual([{ name: 'config.timeout', message: 'Must be positive' }]);
  });

  it('should stringify primitive field error values', () => {
    const error = new RequestError('Validation failed', undefined, 400, {}, { retries: 0 });
    const result = edaErrorAdapter(error);
    expect(result.fieldErrors).toEqual([{ name: 'retries', message: '0' }]);
  });

  it('should ignore empty validation arrays', () => {
    const error = new RequestError('Validation failed', undefined, 400, {}, { name: [] });
    const result = edaErrorAdapter(error);
    expect(result.fieldErrors.length).toBe(0);
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
