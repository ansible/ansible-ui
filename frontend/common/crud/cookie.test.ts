import { afterEach, describe, expect, it } from 'vitest';
import { getCookie, setCookie } from './cookie';

describe('cookie helpers', () => {
  afterEach(() => {
    document.cookie = 'test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('should set and read a cookie value', () => {
    setCookie('test_cookie', 'abc123');
    expect(getCookie('test_cookie')).toBe('abc123');
  });

  it('should return undefined when cookie is missing', () => {
    expect(getCookie('missing_cookie')).toBeUndefined();
  });
});
