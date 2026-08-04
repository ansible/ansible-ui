import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import { genericErrorAdapter } from './genericErrorAdapter';

describe('genericErrorAdapter', () => {
  it('should return generic error when error is an instance of Error', () => {
    const error = new Error('Test Error');
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [{ message: 'Test Error' }],
      fieldErrors: [],
    });
  });

  it('should return empty errors when error is not a known error', () => {
    const error = { random: 'error' };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  it('should return error message when RequestError json is not an object or null', () => {
    const error = new RequestError(
      'Error Message',
      undefined,
      400,
      { name: 'Plain text body' },
      undefined
    );
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [{ message: 'Error Message' }],
      fieldErrors: [],
    });
  });

  it('should process non_field_errors errors correctly', () => {
    const errorBody = {
      non_field_errors: ['Generic Error 1', 'Generic Error 2'],
      username: ['Username is already taken'],
    };
    const error = new RequestError('Error Message', undefined, 400, errorBody, errorBody);
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [{ message: 'Generic Error 1' }, { message: 'Generic Error 2' }],
      fieldErrors: [{ name: 'username', message: 'Username is already taken' }],
    });
  });

  it('should process "detail" key as a generic error', () => {
    const errorBody = {
      detail: 'This is a generic error',
    };
    const error = new RequestError('Error Message', undefined, 403, errorBody, errorBody);
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [{ message: 'This is a generic error' }],
      fieldErrors: [],
    });
  });

  it('should return generic error when error is a string', () => {
    const result = genericErrorAdapter('Something went wrong');
    expect(result).toEqual({
      genericErrors: [{ message: 'Something went wrong' }],
      fieldErrors: [],
    });
  });

  it('should return generic errors when error is an array of strings', () => {
    const result = genericErrorAdapter(['Error 1', 'Error 2', 'Error 3']);
    expect(result).toEqual({
      genericErrors: [{ message: 'Error 1' }, { message: 'Error 2' }, { message: 'Error 3' }],
      fieldErrors: [],
    });
  });

  it('should skip non-string items in an error array', () => {
    const result = genericErrorAdapter(['Valid error', 123, null, 'Another error']);
    expect(result).toEqual({
      genericErrors: [{ message: 'Valid error' }, { message: 'Another error' }],
      fieldErrors: [],
    });
  });

  it('should return empty errors when error is null', () => {
    const result = genericErrorAdapter(null);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  it('should process json key with nested field errors as strings', () => {
    const error = {
      json: {
        email: 'Invalid email address',
        name: 'Name is required',
      },
    };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'email', message: 'Invalid email address' },
        { name: 'name', message: 'Name is required' },
      ],
    });
  });

  it('should process json key with nested field errors as arrays', () => {
    const error = {
      json: {
        username: ['Username is too short', 'Username already exists'],
        password: ['Password is too weak'],
      },
    };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'username', message: 'Username is too short' },
        { name: 'username', message: 'Username already exists' },
        { name: 'password', message: 'Password is too weak' },
      ],
    });
  });

  it('should process json key with non_field_errors as a string', () => {
    const error = {
      json: {
        non_field_errors: 'A general error occurred',
      },
    };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [{ message: 'A general error occurred' }],
      fieldErrors: [],
    });
  });

  it('should process json key with detail as a generic error', () => {
    const error = {
      json: {
        detail: 'Permission denied',
      },
    };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [{ message: 'Permission denied' }],
      fieldErrors: [],
    });
  });

  it('should handle json key being null', () => {
    const error = { json: null };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  it('should handle json key being a non-object value', () => {
    const error = { json: 'not an object' };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  it('should return empty errors for undefined', () => {
    const result = genericErrorAdapter(undefined);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  it('should return empty errors for a number', () => {
    const result = genericErrorAdapter(42);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  it('should skip non-string values in json field error arrays', () => {
    const error = {
      json: {
        field: ['Valid message', 123, null, 'Another message'],
      },
    };
    const result = genericErrorAdapter(error);
    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'field', message: 'Valid message' },
        { name: 'field', message: 'Another message' },
      ],
    });
  });
});
