import { RequestError } from '../../common/crud/RequestError';
import { edaErrorAdapter, useEdaErrorMessageParser } from './edaErrorAdapter';

describe('edaErrorAdapter', () => {
  it('should return empty arrays when passed an empty object', () => {
    const error = new RequestError('Some Error', undefined, 400, {}, {});
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors.length).equal(0);
  });

  it('should return empty arrays when passed an Error instance', () => {
    const error = new Error('Something went wrong');
    const result = edaErrorAdapter(error);
    expect(result.genericErrors).to.deep.equal([{ message: 'Something went wrong' }]);
    expect(result.fieldErrors.length).equal(0);
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
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors).to.deep.equal([
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
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors).to.deep.equal([
      { name: 'name', message: 'activation with this name already exists.' },
    ]);
  });

  it('should deal with "errors" errors as generic errors', () => {
    const error = new RequestError(
      'Errors',
      undefined,
      400,
      {},
      { non_field_errors: ['No controller token specified'] }
    );
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).equal(1);
    expect(result.fieldErrors.length).equal(0);
    expect(result.genericErrors).to.deep.equal([{ message: 'No controller token specified' }]);
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
    expect(result.message).equal('Name is required');
    expect(result.parsedErrors).to.deep.equal([{ message: 'Name is required' }]);
  });
});
