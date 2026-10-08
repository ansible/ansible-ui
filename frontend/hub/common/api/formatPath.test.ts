import { describe, expect, it } from 'vitest';
import { hubAPI, pulpAPI } from './formatPath';

describe('formatPath', () => {
  it('hubAPI builds galaxy UI paths with trailing slash', () => {
    expect(hubAPI`/_ui/v1/namespaces/`).toContain('/_ui/v1/namespaces/');
  });

  it('pulpAPI builds pulp paths with trailing slash', () => {
    expect(pulpAPI`/repositories/ansible/ansible/`).toContain('/repositories/ansible/ansible/');
  });

  it('hubAPI encodes path segments', () => {
    expect(hubAPI`/_ui/v1/namespaces/${'my ns'}/`).toContain('my%20ns');
  });
});
