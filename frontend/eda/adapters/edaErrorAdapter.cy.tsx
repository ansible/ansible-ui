import { RequestError } from '../../common/crud/RequestError';
import { edaErrorAdapter } from './edaErrorAdapter';

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
      { name: ['Name is required'], email: ['Email is invalid'] }
    );
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors).to.deep.equal([
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
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors).to.deep.equal([{ name: 'name', message: 'Name is required' }]);
  });

  it('should deal with "errors" errors as generic errors', () => {
    const error = new RequestError(
      'Errors',
      undefined,
      400,
      {},
      {
        errors: "{'errors': 'No controller token specified'}",
      }
    );
    const result = edaErrorAdapter(error);
    expect(result.genericErrors.length).equal(1);
    expect(result.fieldErrors.length).equal(0);
    expect(result.genericErrors).to.deep.equal([
      { message: "{'errors': 'No controller token specified'}" },
    ]);
  });
});
