import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import { isApplicationListForbidden } from './applicationListAccess';

describe('applicationListAccess', () => {
  it('should treat HTTP 403 as list forbidden', () => {
    const error = new RequestError('Forbidden', undefined, 403, undefined, undefined);
    expect(isApplicationListForbidden(error)).toBe(true);
  });

  it('should not treat other errors as list forbidden', () => {
    const error = new RequestError('Server Error', undefined, 500, undefined, undefined);
    expect(isApplicationListForbidden(error)).toBe(false);
    expect(isApplicationListForbidden(new Error('network'))).toBe(false);
  });
});
