import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import { hubErrorAdapter, useHubErrorMessageParser } from './hubErrorAdapter';

describe('hubErrorAdapter Unit Tests', () => {
  it('should handle non_field_errors correctly', () => {
    const error = new RequestError(
      'Test message',
      undefined,
      400,
      { non_field_errors: ['Error message 1'] },
      { non_field_errors: ['Error message 1'] }
    );

    const expectedOutput = {
      genericErrors: [{ message: 'Error message 1' }],
      fieldErrors: [],
    };

    const hubError = hubErrorAdapter(error);

    expect(hubError).toEqual(expectedOutput);
  });

  it('should handle string data correctly', () => {
    const error = new RequestError('Error message', undefined, 500, 'Error message', undefined);
    const expectedOutput = {
      genericErrors: [{ message: 'Error message' }],
      fieldErrors: [],
    };

    expect(hubErrorAdapter(error)).toEqual(expectedOutput);
  });

  it('should handle Galaxy errors correctly', () => {
    const errorData = {
      errors: [
        {
          status: '400',
          code: 'invalid',
          title: 'Invalid input',
          detail: 'The provided base path contains forbidden characters',
          source: { parameter: 'field1' },
        },
      ],
    };
    const error = new RequestError('Test message', undefined, 400, errorData, errorData);

    const expectedOutput = {
      genericErrors: [],
      fieldErrors: [
        { name: 'field1', message: 'The provided base path contains forbidden characters' },
      ],
    };

    expect(hubErrorAdapter(error)).toEqual(expectedOutput);
  });

  it('should handle Pulp errors correctly', () => {
    const error = new RequestError(
      'Test message',
      undefined,
      400,
      {
        field1: ['Error message 1'],
      },
      {
        field1: ['Error message 1'],
      }
    );

    const expectedOutput = {
      genericErrors: [],
      fieldErrors: [{ name: 'field1', message: 'Error message 1' }],
    };

    expect(hubErrorAdapter(error)).toEqual(expectedOutput);
  });

  it('should map galaxy field keys when mappedKeys is provided', () => {
    const errorData = {
      errors: [
        {
          status: '400',
          code: 'invalid',
          title: 'Invalid',
          detail: 'Bad value',
          source: { parameter: 'remote_registry' },
        },
      ],
    };
    const error = new RequestError('Test message', undefined, 400, errorData, errorData);

    expect(hubErrorAdapter(error, { remote_registry: 'registry' })).toEqual({
      genericErrors: [],
      fieldErrors: [{ name: 'registry', message: 'Bad value' }],
    });
  });

  it('should rename filename field errors to file', () => {
    const error = new RequestError(
      'Test message',
      undefined,
      400,
      { filename: ['Invalid file'] },
      { filename: ['Invalid file'] }
    );

    expect(hubErrorAdapter(error).fieldErrors).toEqual([{ name: 'file', message: 'Invalid file' }]);
  });

  it('should handle plain Error instances', () => {
    expect(hubErrorAdapter(new Error('Network down'))).toEqual({
      genericErrors: [{ message: 'Network down' }],
      fieldErrors: [],
    });
  });

  it('should handle CSRF errors correctly', () => {
    const error = new RequestError(
      'Test message',
      undefined,
      403,
      { detail: 'CSRF Failed: CSRF cookie not set.' },
      { detail: 'CSRF Failed: CSRF cookie not set.' }
    );

    const expectedOutput = {
      genericErrors: [{ message: 'CSRF Failed: CSRF cookie not set.' }],
      fieldErrors: [],
    };

    expect(hubErrorAdapter(error)).toEqual(expectedOutput);
  });
});

describe('useHubErrorMessageParser', () => {
  it('should return a message and parsedErrors', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {},
      { name: ['Name is required'] }
    );
    const parseError = useHubErrorMessageParser();
    const result = parseError(error);
    expect(result.message).toBe('Name is required');
    expect(result.parsedErrors).toEqual([{ message: 'Name is required' }]);
  });
});
