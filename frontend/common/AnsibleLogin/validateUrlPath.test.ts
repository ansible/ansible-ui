import { describe, expect, it } from 'vitest';
import { validateUrlPath } from './validateUrlPath';

describe('validateUrlPath', () => {
  describe('null and empty inputs', () => {
    it('should return null if null is given', () => {
      expect(validateUrlPath(null)).toBeNull();
    });

    it('should return null if empty string is given', () => {
      expect(validateUrlPath('')).toBeNull();
    });
  });

  describe('valid simple paths', () => {
    it('should return root path', () => {
      expect(validateUrlPath('/')).toBe('/');
    });

    it('should return single segment path', () => {
      expect(validateUrlPath('/foo')).toBe('/foo');
    });

    it('should return multi-segment path', () => {
      expect(validateUrlPath('/foo/bar')).toBe('/foo/bar');
    });

    it('should return path with trailing slash', () => {
      expect(validateUrlPath('/foo/bar/')).toBe('/foo/bar/');
    });

    it('should return path with hyphens', () => {
      expect(validateUrlPath('/foo-bar/baz/')).toBe('/foo-bar/baz/');
    });

    it('should return path with underscores', () => {
      expect(validateUrlPath('/foo/bar_baz/')).toBe('/foo/bar_baz/');
    });

    it('should return path with dots', () => {
      expect(validateUrlPath('/foo/bar.json')).toBe('/foo/bar.json');
    });

    it('should return path with percent-encoded characters', () => {
      expect(validateUrlPath('/foo/bar%20baz')).toBe('/foo/bar%20baz');
    });
  });

  describe('valid paths with query parameters', () => {
    it('should return path with single query param', () => {
      expect(validateUrlPath('/foo/bar?page=3')).toBe('/foo/bar?page=3');
    });

    it('should return path with multiple query params', () => {
      expect(validateUrlPath('/foo/bar?page=2&order_by=name')).toBe(
        '/foo/bar?page=2&order_by=name'
      );
    });
  });

  describe('paths with plus sign (AAP-64996)', () => {
    it('should return path with plus sign in query params', () => {
      expect(validateUrlPath('/foo/bar?scope=openid+read')).toBe('/foo/bar?scope=openid+read');
    });

    it('should return path with encoded plus sign', () => {
      expect(validateUrlPath('/foo/bar?scope=openid%2Bread')).toBe('/foo/bar?scope=openid%2Bread');
    });

    it('should return OAuth authorize URL with plus-separated scopes', () => {
      expect(validateUrlPath('/o/authorize/?response_type=code&scope=openid+read')).toBe(
        '/o/authorize/?response_type=code&scope=openid+read'
      );
    });

    it('should return path with plus sign in path segment', () => {
      expect(validateUrlPath('/foo/bar+baz')).toBe('/foo/bar+baz');
    });
  });

  describe('invalid paths - no leading slash', () => {
    it('should return null for relative path', () => {
      expect(validateUrlPath('incomplete/path')).toBeNull();
    });

    it('should return null for plain string', () => {
      expect(validateUrlPath('not-a-path')).toBeNull();
    });
  });

  describe('invalid paths - protocol attacks', () => {
    it('should return null for javascript: protocol', () => {
      expect(validateUrlPath('javascript:alert("foo")')).toBeNull();
    });

    it('should return null for data: protocol', () => {
      expect(validateUrlPath('data:text/html,<h1>test</h1>')).toBeNull();
    });
  });

  describe('invalid paths - absolute URLs', () => {
    it('should return null for https URL', () => {
      expect(validateUrlPath('https://example.com')).toBeNull();
    });

    it('should return null for https URL with path', () => {
      expect(validateUrlPath('https://example.com/foo')).toBeNull();
    });

    it('should return null for https URL with query params', () => {
      expect(validateUrlPath('https://example.com/foo?bar=baz')).toBeNull();
    });

    it('should return null for http URL', () => {
      expect(validateUrlPath('http://example.com')).toBeNull();
    });
  });

  describe('invalid paths - protocol-relative URLs', () => {
    it('should return null for protocol-relative URL', () => {
      expect(validateUrlPath('//example.com')).toBeNull();
    });

    it('should return null for protocol-relative URL with path', () => {
      expect(validateUrlPath('//example.com/foo')).toBeNull();
    });

    it('should return null for protocol-relative URL to localhost', () => {
      expect(validateUrlPath('//localhost')).toBeNull();
    });

    it('should return null for protocol-relative URL to localhost with path', () => {
      expect(validateUrlPath('//localhost/foo')).toBeNull();
    });

    it('should return null for backslash protocol-relative URL', () => {
      expect(validateUrlPath('/\\example.com')).toBeNull();
    });
  });
});
