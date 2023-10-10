import { RequestError } from '../../common/crud/RequestError';
import { hubErrorAdapter } from './hubErrorAdapter';

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

    expect(hubError).to.deep.equal(expectedOutput);
  });

  it('should handle string data correctly', () => {
    const error = new RequestError('Error message', undefined, 500, 'Error message', undefined);
    const expectedOutput = {
      genericErrors: [{ message: 'Error message' }],
      fieldErrors: [],
    };

    expect(hubErrorAdapter(error)).to.deep.equal(expectedOutput);
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

    expect(hubErrorAdapter(error)).to.deep.equal(expectedOutput);
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

    expect(hubErrorAdapter(error)).to.deep.equal(expectedOutput);
  });
});
