import { describe, expect, it } from 'vitest';
import { ExecutionEnvironmentImage } from '../../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImage';
import { isManifestList } from './isManifestList';

describe('isManifestList', () => {
  it('detects manifest list media type', () => {
    const manifestList = {
      media_type: 'application/vnd.docker.distribution.manifest.list.v2+json',
    } as ExecutionEnvironmentImage;
    const image = {
      media_type: 'application/vnd.docker.container.image.v1+json',
    } as ExecutionEnvironmentImage;

    expect(isManifestList(manifestList)).toBe(true);
    expect(isManifestList(image)).toBe(false);
  });
});
