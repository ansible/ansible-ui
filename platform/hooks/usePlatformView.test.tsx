import { describe, expect, test } from 'vitest';
import { getQueryString } from './usePlatformView';

describe('getQueryString', () => {
  test('should encode scalar query parameters', () => {
    expect(getQueryString({ name: 'ansible', page: '2' })).toBe('name=ansible&page=2');
  });

  test('should encode array query parameters as repeated keys', () => {
    expect(getQueryString({ tags: ['a', 'b'] })).toBe('tags=a&tags=b');
  });
});
