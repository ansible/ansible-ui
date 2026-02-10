import { describe, expect, it } from 'vitest';
import { validateUrlPath } from './validateUrlPath';

describe('validateUrlPath', () => {
  it('should return null if no path given', () => {
    expect(validateUrlPath(null)).toBeNull();
  });

  it('should return valid path', () => {
    expect(validateUrlPath('/foo/bar')).toBe('/foo/bar');
    expect(validateUrlPath('/foo')).toBe('/foo');
    expect(validateUrlPath('/')).toBe('/');
    expect(validateUrlPath('/foo-bar/baz/')).toBe('/foo-bar/baz/');
    expect(validateUrlPath('/foo/bar_baz/')).toBe('/foo/bar_baz/');
  });

  it('should return valid path with query params', () => {
    expect(validateUrlPath('/foo/bar?page=3')).toBe('/foo/bar?page=3');
    expect(validateUrlPath('/foo/bar?page=2&order_by=name')).toBe('/foo/bar?page=2&order_by=name');
  });

  it('should return null for path not beginning with slash', () => {
    expect(validateUrlPath('incomplete/path')).toBeNull();
  });

  it('should return null for invalid path', () => {
    expect(validateUrlPath('not-a-path')).toBeNull();
    expect(validateUrlPath('javascript:alert("foo")')).toBeNull();
  });

  it('should return null for fully qualified url', () => {
    expect(validateUrlPath('https://example.com')).toBeNull();
    expect(validateUrlPath('https://example.com/foo')).toBeNull();
    expect(validateUrlPath('https://example.com/foo?bar=baz')).toBeNull();
  });
});
