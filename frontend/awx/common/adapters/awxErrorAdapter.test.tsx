import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import { awxErrorAdapter, useAwxErrorMessageParser } from './awxErrorAdapter';

describe('awxErrorAdapter', () => {
  it('should return empty arrays when passed an empty object', () => {
    const error = new RequestError('Some Error', undefined, 400, {}, {});
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors.length).toBe(0);
  });

  it('should return generic error message when passed an Error instance', () => {
    const error = new Error('Something went wrong');
    const result = awxErrorAdapter(error);
    expect(result.genericErrors).toEqual([{ message: 'Something went wrong' }]);
    expect(result.fieldErrors.length).toBe(0);
  });

  it('should return field errors when passed a RequestError instance with JSON data', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { name: ['Name is required'], email: ['Email is invalid'] }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors).toEqual([
      { name: 'name', message: 'Name is required' },
      { name: 'email', message: 'Email is invalid' },
    ]);
  });

  it('should return field errors with the first value of an array', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { name: ['Name is required', 'Name is too short'] }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors).toEqual([{ name: 'name', message: 'Name is required' }]);
  });

  it('should return field errors with the first value of an array even if it is not a string', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { name: [42, 'Name is too short'] }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors).toEqual([{ name: 'name', message: '42' }]);
  });

  it('should deal with __all__ errors as generic errors', () => {
    const error = new RequestError('Validation failed', undefined, 400, {}, { __all__: ['Error'] });
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(1);
    expect(result.fieldErrors.length).toBe(0);
    expect(result.genericErrors).toEqual([{ message: 'Error' }]);
  });

  it('should deal with detail as generic errors', () => {
    const error = new RequestError('Validation failed', undefined, 400, {}, { detail: 'Error' });
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(1);
    expect(result.fieldErrors.length).toBe(0);
    expect(result.genericErrors).toEqual([{ message: 'Error' }]);
  });

  it('should deal with {error: "error msg"} as generic errors', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { error: ['Cannot assign type of galaxy'] }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(1);
    expect(result.fieldErrors.length).toBe(0);
    expect(result.genericErrors).toEqual([{ message: 'Cannot assign type of galaxy' }]);
  });

  it('should handle inputs as generic errors when it is an array of strings', () => {
    const error = new RequestError('Input error', undefined, 400, {}, { inputs: ['Error'] });
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(1);
    expect(result.fieldErrors.length).toBe(0);
    expect(result.genericErrors).toEqual([{ message: 'Error' }]);
  });

  it('should handle inputs as field errors when it is an object with an array', () => {
    const error = new RequestError(
      'Input error',
      undefined,
      400,
      {},
      { inputs: { name: ['Name is required'] } }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors.length).toBe(1);
    expect(result.fieldErrors).toEqual([{ name: 'name', message: 'Name is required' }]);
  });

  it('should handle inputs as field errors when it is an object with a string', () => {
    const error = new RequestError(
      'Input error',
      undefined,
      400,
      {},
      { inputs: { name: 'Name is required' } }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).toBe(0);
    expect(result.fieldErrors.length).toBe(1);
    expect(result.fieldErrors).toEqual([{ name: 'name', message: 'Name is required' }]);
  });
});

describe('useAwxErrorMessageParser', () => {
  it('should return a message and parsedErrors', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { name: ['Name is required'] }
    );
    const parseError = useAwxErrorMessageParser();
    const result = parseError(error);
    expect(result.message).toBe('Name is required');
    expect(result.parsedErrors).toEqual([{ message: 'Name is required' }]);
  });
});

describe('awxErrorAdapter — AWX YAML/JSON parse errors (AAP-93178)', () => {
  // The AWX backend returns this specific message format when extra_vars (or any
  // YAML/JSON field) cannot be parsed server-side.  The adapter must surface it
  // as a *field* error on `extra_vars` so PageForm can call setFieldError() and
  // display the message directly below the editor — not as a generic banner.
  const AWX_PARSE_ERROR =
    'Cannot parse as JSON (error: Expecting value: line 1 column 1 (char 0))' +
    ' or YAML (error: Input type `str` is not a dictionary).';

  it('should map AWX extra_vars parse error to a field error', () => {
    const error = new RequestError(
      'Bad Request',
      undefined,
      400,
      {},
      {
        extra_vars: [AWX_PARSE_ERROR],
      }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors).toHaveLength(0);
    expect(result.fieldErrors).toEqual([{ name: 'extra_vars', message: AWX_PARSE_ERROR }]);
  });

  it('should map multiple YAML field errors from the same response', () => {
    // AWX can return parse errors for several fields at once (e.g. extra_vars
    // and source_vars).  Each must become an individual field error.
    const SOURCE_VARS_ERROR = 'Enter a valid JSON or YAML object.';
    const error = new RequestError(
      'Bad Request',
      undefined,
      400,
      {},
      {
        extra_vars: [AWX_PARSE_ERROR],
        source_vars: [SOURCE_VARS_ERROR],
      }
    );
    const result = awxErrorAdapter(error);
    expect(result.genericErrors).toHaveLength(0);
    expect(result.fieldErrors).toEqual(
      expect.arrayContaining([
        { name: 'extra_vars', message: AWX_PARSE_ERROR },
        { name: 'source_vars', message: SOURCE_VARS_ERROR },
      ])
    );
    expect(result.fieldErrors).toHaveLength(2);
  });
});
