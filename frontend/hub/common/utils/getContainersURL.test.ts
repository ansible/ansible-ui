/* eslint-disable i18next/no-literal-string */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContainersURL } from './getContainersURL';

describe('getContainersURL', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { host: 'hub.example.com' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns host and image name only when tag and digest are omitted', () => {
    expect(getContainersURL({ name: 'my-ns/my-image' })).toBe('hub.example.com/my-ns/my-image');
  });

  it('appends tag when provided', () => {
    expect(getContainersURL({ name: 'my-ns/my-image', tag: '1.2.3' })).toBe(
      'hub.example.com/my-ns/my-image:1.2.3'
    );
  });

  it('appends digest when tag is not provided', () => {
    expect(getContainersURL({ name: 'my-ns/my-image', digest: 'sha256:abcdef' })).toBe(
      'hub.example.com/my-ns/my-image@sha256:abcdef'
    );
  });
});
