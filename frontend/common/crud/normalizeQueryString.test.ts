import { describe, expect, it } from 'vitest';
import { normalizeQueryString } from './normalizeQueryString';

describe('normalizeQueryString', () => {
  it('should return empty string for undefined query', () => {
    expect(normalizeQueryString(undefined)).toBe('');
  });

  it('should return empty string for empty query object', () => {
    expect(normalizeQueryString({})).toBe('');
  });

  it('should serialize query parameters', () => {
    expect(normalizeQueryString({ page: 1, active: true, name: 'test' })).toBe(
      '?page=1&active=true&name=test'
    );
  });
});
