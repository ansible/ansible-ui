import { RequestError } from '../../../common/crud/RequestError';
import { awxErrorAdapter, useAwxErrorMessageParser } from './awxErrorAdapter';

describe('awxErrorAdapter', () => {
  it('should return empty arrays when passed an empty object', () => {
    const error = new RequestError('Some Error', undefined, 400, {}, {});
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors.length).equal(0);
  });

  it('should return generic error message when passed an Error instance', () => {
    const error = new Error('Something went wrong');
    const result = awxErrorAdapter(error);
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
    const result = awxErrorAdapter(error);
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
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors).to.deep.equal([{ name: 'name', message: 'Name is required' }]);
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
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors).to.deep.equal([{ name: 'name', message: '42' }]);
  });

  it('should deal with __all__ errors as generic errors', () => {
    const error = new RequestError('Validation failed', undefined, 400, {}, { __all__: ['Error'] });
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).equal(1);
    expect(result.fieldErrors.length).equal(0);
    expect(result.genericErrors).to.deep.equal([{ message: 'Error' }]);
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
    expect(result.genericErrors.length).equal(1);
    expect(result.fieldErrors.length).equal(0);
    expect(result.genericErrors).to.deep.equal([{ message: 'Cannot assign type of galaxy' }]);
  });

  it('should handle inputs as generic errors when it is an array of strings', () => {
    const error = new RequestError('Input error', undefined, 400, {}, { inputs: ['Error'] });
    const result = awxErrorAdapter(error);
    expect(result.genericErrors.length).equal(1);
    expect(result.fieldErrors.length).equal(0);
    expect(result.genericErrors).to.deep.equal([{ message: 'Error' }]);
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
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors.length).equal(1);
    expect(result.fieldErrors).to.deep.equal([{ name: 'name', message: 'Name is required' }]);
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
    expect(result.genericErrors.length).equal(0);
    expect(result.fieldErrors.length).equal(1);
    expect(result.fieldErrors).to.deep.equal([{ name: 'name', message: 'Name is required' }]);
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
    expect(result.message).equal('Name is required');
    expect(result.parsedErrors).to.deep.equal([{ message: 'Name is required' }]);
  });
});
