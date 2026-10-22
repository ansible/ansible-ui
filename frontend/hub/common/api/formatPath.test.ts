import { beforeAll, describe, expect, it } from 'vitest';
import { hubAPI, pulpAPI, setHubApiPath } from './formatPath';

describe('formatPath', () => {
  beforeAll(() => {
    setHubApiPath('/api/galaxy');
  });

  it('hubAPI builds galaxy UI paths with trailing slash', () => {
    expect(hubAPI`/_ui/v1/namespaces/`).toBe('/api/galaxy/_ui/v1/namespaces/');
  });

  it('pulpAPI builds pulp paths with trailing slash', () => {
    expect(pulpAPI`/repositories/ansible/ansible/`).toBe(
      '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/'
    );
  });

  it('hubAPI encodes path segments', () => {
    expect(hubAPI`/_ui/v1/namespaces/${'my ns'}/`).toBe('/api/galaxy/_ui/v1/namespaces/my%20ns/');
  });
});
