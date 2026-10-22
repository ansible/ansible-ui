import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { describe, expect, it } from 'vitest';
import { HubNamespaceErrorAdapter } from './HubNamespaceErrorAdapter';

describe('HubNamespaceErrorAdapter', () => {
  it('moves links field errors to generic errors', () => {
    const error = new RequestError(
      'Validation failed',
      undefined,
      400,
      {
        links__url: ['Invalid URL'],
        links__name: ['Required'],
        name: ['Name is required'],
      },
      {
        links__url: ['Invalid URL'],
        links__name: ['Required'],
        name: ['Name is required'],
      }
    );

    const result = HubNamespaceErrorAdapter(error);

    expect(result.fieldErrors).toEqual([{ name: 'name', message: 'Name is required' }]);
    expect(result.genericErrors).toEqual([{ message: 'Invalid URL' }, { message: 'Required' }]);
  });
});
