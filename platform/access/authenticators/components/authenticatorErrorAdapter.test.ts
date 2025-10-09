import { describe, expect, test } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { authenticatorErrorAdapter } from './authenticatorErrorAdapter';

describe('authenticatorErrorAdapter', () => {
  const mockConfigurationFields = ['BIND_DN', 'SERVER_URI', 'GROUP_TYPE'];

  test('should handle error with non_field_errors', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      { non_field_errors: ['Invalid configuration', 'Another error'] },
      { non_field_errors: ['Invalid configuration', 'Another error'] }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [{ message: 'Invalid configuration' }, { message: 'Another error' }],
      fieldErrors: [],
    });
  });

  test('should handle regular field errors', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      { name: ['This field is required'], enabled: ['Invalid value'] },
      { name: ['This field is required'], enabled: ['Invalid value'] }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'name', message: 'This field is required' },
        { name: 'enabled', message: 'Invalid value' },
      ],
    });
  });

  test('should handle configuration field errors', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      {
        BIND_DN: ['Invalid DN format'],
        SERVER_URI: ['Invalid URI'],
      },
      {
        BIND_DN: ['Invalid DN format'],
        SERVER_URI: ['Invalid URI'],
      }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'configuration.BIND_DN', message: 'Invalid DN format' },
        { name: 'configuration.SERVER_URI', message: 'Invalid URI' },
      ],
    });
  });

  test('should handle nested configuration field errors', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      { 'GROUP_TYPE.class_name': ['Invalid class name'] },
      { 'GROUP_TYPE.class_name': ['Invalid class name'] }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'configuration.GROUP_TYPE', message: 'class_name: Invalid class name' },
      ],
    });
  });

  test('should handle RequestError with object-style configuration errors', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      {
        GROUP_TYPE: {
          class_name: 'Invalid class',
          base_dn: 'Invalid DN',
        },
      },
      {
        GROUP_TYPE: {
          class_name: 'Invalid class',
          base_dn: 'Invalid DN',
        },
      }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        {
          name: 'configuration.GROUP_TYPE',
          message: 'class_name: Invalid class; base_dn: Invalid DN',
        },
      ],
    });
  });

  test('should handle RequestError with object-style non-configuration errors', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      {
        some_field: {
          nested_field: 'Error message',
          another_field: 'Another error',
        },
      },
      {
        some_field: {
          nested_field: 'Error message',
          another_field: 'Another error',
        },
      }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        {
          name: 'some_field',
          message: 'nested_field: Error message; another_field: Another error',
        },
      ],
    });
  });

  test('should handle regular Error objects', () => {
    const mockError = new Error('Something went wrong');

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [{ message: 'Something went wrong' }],
      fieldErrors: [],
    });
  });

  test('should handle non-RequestError objects gracefully', () => {
    const mockError = { some: 'object' };

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  test('should handle generic request error', () => {
    const mockError = new RequestError('Bad Request', undefined, 400, 'text response', undefined);

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [{ message: 'Bad Request' }],
      fieldErrors: [],
    });
  });

  test('should handle mixed error types', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      {
        non_field_errors: ['Generic error'],
        name: ['Field error'],
        BIND_DN: ['Config error'],
        'GROUP_TYPE.param': ['Nested config error'],
      },
      {
        non_field_errors: ['Generic error'],
        name: ['Field error'],
        BIND_DN: ['Config error'],
        'GROUP_TYPE.param': ['Nested config error'],
      }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [{ message: 'Generic error' }],
      fieldErrors: [
        { name: 'name', message: 'Field error' },
        { name: 'configuration.BIND_DN', message: 'Config error' },
        { name: 'configuration.GROUP_TYPE', message: 'param: Nested config error' },
      ],
    });
  });

  test('should handle empty configuration fields array', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      {
        BIND_DN: ['Should not be prefixed'],
        name: ['Regular field error'],
      },
      {
        BIND_DN: ['Should not be prefixed'],
        name: ['Regular field error'],
      }
    );

    const result = authenticatorErrorAdapter(mockError, []);

    expect(result).toEqual({
      genericErrors: [],
      fieldErrors: [
        { name: 'BIND_DN', message: 'Should not be prefixed' },
        { name: 'name', message: 'Regular field error' },
      ],
    });
  });

  test('should handle non_field_errors with non-string values', () => {
    const mockError = new RequestError(
      'Bad Request',
      undefined,
      400,
      { non_field_errors: ['Valid error', 123, null] },
      { non_field_errors: ['Valid error', 123, null] }
    );

    const result = authenticatorErrorAdapter(mockError, mockConfigurationFields);

    expect(result).toEqual({
      genericErrors: [{ message: 'Valid error' }],
      fieldErrors: [],
    });
  });
});
