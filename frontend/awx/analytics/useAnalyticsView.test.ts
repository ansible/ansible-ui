import { describe, expect, it } from 'vitest';
import { getQueryString } from './useAnalyticsView';

describe('getQueryString', () => {
  it('encodes query parameters', () => {
    expect(getQueryString({ foo: 'bar baz', empty: '' })).toBe('foo=bar%20baz&empty=');
  });

  it('returns empty string for empty params', () => {
    expect(getQueryString({})).toBe('');
  });
});
