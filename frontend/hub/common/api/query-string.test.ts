import { describe, expect, it } from 'vitest';
import { url2keys, hubQueryString } from './query-string';

describe('url2keys', () => {
  it('should return default keys for an unrecognized URL', () => {
    expect(url2keys('/api/unknown/')).toEqual({ sortKey: 'sort', pageKey: 'offset' });
  });

  it('should return "ordering" sort key for pulp v3 URLs', () => {
    const result = url2keys('/pulp/api/v3/repositories/');
    expect(result.sortKey).toBe('ordering');
  });

  it('should return "sort" sort key and "offset" page key for _ui/v1 URLs', () => {
    const result = url2keys('/_ui/v1/namespaces/');
    expect(result).toEqual({ sortKey: 'sort', pageKey: 'offset' });
  });

  it('should return "order_by" sort key and "page" page key for _ui/v2 URLs', () => {
    const result = url2keys('/_ui/v2/collection_versions/');
    expect(result).toEqual({ sortKey: 'order_by', pageKey: 'page' });
  });

  it('should return "order_by" sort key and "page" page key for /v1/imports/', () => {
    const result = url2keys('/v1/imports/');
    expect(result).toEqual({ sortKey: 'order_by', pageKey: 'page' });
  });

  it('should return "order_by" sort key and "page" page key for /v1/roles/', () => {
    const result = url2keys('/v1/roles/');
    expect(result).toEqual({ sortKey: 'order_by', pageKey: 'page' });
  });

  it('should return "page" page key for /v1/namespaces/', () => {
    const result = url2keys('/v1/namespaces/');
    expect(result.pageKey).toBe('page');
  });

  it('should return "sort" for pulp_container/namespaces sort key', () => {
    const result = url2keys('/pulp/api/v3/pulp_container/namespaces/');
    expect(result.sortKey).toBe('sort');
  });

  it('should return "order_by" for collection-versions search endpoint', () => {
    const result = url2keys('/v3/plugin/ansible/search/collection-versions/');
    expect(result.sortKey).toBe('order_by');
  });
});

describe('hubQueryString', () => {
  it('should produce a query string with default keys for unknown URLs', () => {
    const qs = hubQueryString('/api/unknown/', { sort: 'name', offset: 0, limit: 10 });
    expect(qs).toContain('sort=name');
    expect(qs).toContain('offset=0');
    expect(qs).toContain('limit=10');
  });

  it('should remap "sort" to "ordering" for pulp v3 URLs', () => {
    const qs = hubQueryString('/pulp/api/v3/repositories/', { sort: '-name' });
    expect(qs).toContain('ordering=-name');
    expect(qs).not.toContain('sort=');
  });

  it('should remap "sort" to "order_by" for _ui/v2 URLs', () => {
    const qs = hubQueryString('/_ui/v2/collection_versions/', { sort: 'name' });
    expect(qs).toContain('order_by=name');
  });

  it('should convert offset to page when target uses page-based pagination', () => {
    const qs = hubQueryString('/_ui/v2/collection_versions/', { offset: 20, limit: 10 });
    expect(qs).toContain('page=3');
    expect(qs).not.toContain('offset=');
  });

  it('should convert page to offset when target uses offset-based pagination', () => {
    const qs = hubQueryString('/_ui/v1/namespaces/', { page: 3, page_size: 10 });
    expect(qs).toContain('offset=20');
    expect(qs).not.toContain('page=');
  });

  it('should remap page_size to limit for offset-based endpoints', () => {
    const qs = hubQueryString('/_ui/v1/namespaces/', { page_size: 25 });
    expect(qs).toContain('limit=25');
    expect(qs).not.toContain('page_size=');
  });

  it('should remap limit to page_size for page-based endpoints', () => {
    const qs = hubQueryString('/_ui/v2/collection_versions/', { limit: 25 });
    expect(qs).toContain('page_size=25');
    expect(qs).not.toContain('limit=');
  });

  it('should URL-encode special characters in values', () => {
    const qs = hubQueryString('/api/unknown/', { name: 'hello world' });
    // encodeURIComponent runs first, then URLSearchParams encodes the result again
    expect(qs).toContain('name=hello%2520world');
  });

  it('should use default limit of 10 when neither page_size nor limit is provided', () => {
    const qs = hubQueryString('/_ui/v2/collection_versions/', { offset: 30 });
    expect(qs).toContain('page=4');
  });

  it('should handle boolean values', () => {
    const qs = hubQueryString('/api/unknown/', { is_signed: true });
    expect(qs).toContain('is_signed=true');
  });

  it('should handle numeric values', () => {
    const qs = hubQueryString('/api/unknown/', { count: 42 });
    expect(qs).toContain('count=42');
  });

  it('should return an empty string when params is empty', () => {
    const qs = hubQueryString('/api/unknown/', {});
    expect(qs).toBe('');
  });
});
