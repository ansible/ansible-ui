import { RequestError } from '../../frontend/common/crud/RequestError';
import { genericErrorAdapter } from './genericErrorAdapter';

describe('genericErrorAdapter', () => {
  it('should return generic error when error is an instance of Error', () => {
    const error = new Error('Test Error');
    const result = genericErrorAdapter(error);
    expect(result).to.deep.equal({
      genericErrors: [{ message: 'Test Error' }],
      fieldErrors: [],
    });
  });

  it('should return empty errors when error is not a known error', () => {
    const error = { random: 'error' };
    const result = genericErrorAdapter(error);
    expect(result).to.deep.equal({
      genericErrors: [],
      fieldErrors: [],
    });
  });

  it('should return empty errors when RequestError json is not an object or null', () => {
    const error = new RequestError(
      'Error Message',
      undefined,
      400,
      { name: 'Plain text body' },
      undefined
    );
    const result = genericErrorAdapter(error);
    expect(result).to.deep.equal({
      genericErrors: [],
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
    expect(result).to.deep.equal({
      genericErrors: [{ message: 'Generic Error 1' }, { message: 'Generic Error 2' }],
      fieldErrors: [{ name: 'username', message: 'Username is already taken' }],
    });
  });
});
