import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import {
  awxApplicationListForbiddenMessage,
  createApplicationListQueryErrorText,
  isApplicationListForbidden,
  oauthApplicationListForbiddenMessage,
} from './applicationListAccess';

describe('applicationListAccess', () => {
  const t = ((key: string) => key) as TFunction;

  it('should treat HTTP 403 as list forbidden', () => {
    const error = new RequestError('Forbidden', undefined, 403, undefined, undefined);
    expect(isApplicationListForbidden(error)).toBe(true);
  });

  it('should not treat other errors as list forbidden', () => {
    const error = new RequestError('Server Error', undefined, 500, undefined, undefined);
    expect(isApplicationListForbidden(error)).toBe(false);
    expect(isApplicationListForbidden(new Error('network'))).toBe(false);
  });

  it('should return forbidden message for OAuth applications', () => {
    expect(oauthApplicationListForbiddenMessage(t)).toContain('OAuth applications');
  });

  it('should return forbidden message for AWX applications', () => {
    expect(awxApplicationListForbiddenMessage(t)).toContain('view applications');
  });

  it('should map 403 errors to the forbidden message in query error text', () => {
    const forbiddenMessage = 'Forbidden applications list';
    const queryErrorText = createApplicationListQueryErrorText(t, forbiddenMessage) as (
      error: Error
    ) => string;
    const error = new RequestError('Forbidden', undefined, 403, undefined, undefined);

    expect(queryErrorText(error)).toBe(forbiddenMessage);
  });

  it('should map non-403 errors to generic loading error text', () => {
    const forbiddenMessage = 'Forbidden applications list';
    const queryErrorText = createApplicationListQueryErrorText(t, forbiddenMessage) as (
      error: Error
    ) => string;
    const error = new RequestError('Server Error', undefined, 500, undefined, undefined);

    expect(queryErrorText(error)).toBe('Error loading applications');
  });
});
