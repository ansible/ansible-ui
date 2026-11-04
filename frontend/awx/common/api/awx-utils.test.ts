import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { awxAPI, awxApiPath, setAwxApiPath } from './awx-utils';

describe('awx-utils', () => {
  let originalPath: string;

  beforeEach(() => {
    originalPath = awxApiPath;
  });

  afterEach(() => {
    setAwxApiPath(originalPath);
  });

  it('builds API paths from the configured prefix', () => {
    setAwxApiPath('/api/custom');
    expect(awxAPI`/jobs/`).toBe('/api/custom/jobs/');
  });
});
