import { describe, expect, it } from 'vitest';
import { awxAPI, awxApiPath, setAwxApiPath } from './awx-utils';

describe('awx-utils', () => {
  it('builds API paths from the configured prefix', () => {
    const original = awxApiPath;
    setAwxApiPath('/api/custom');
    expect(awxAPI`/jobs/`).toBe('/api/custom/jobs/');
    setAwxApiPath(original);
  });
});
