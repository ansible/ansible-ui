import { describe, expect, it } from 'vitest';
import { getIdFromAwxRelatedUrl, getSyncJobId } from './getSyncJobId';

describe('getIdFromAwxRelatedUrl', () => {
  it('should parse id from a related job URL', () => {
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/123/')).toBe(123);
    expect(getIdFromAwxRelatedUrl('/api/controller/v2/project_updates/42')).toBe(42);
  });

  it('should return undefined for empty or invalid values', () => {
    expect(getIdFromAwxRelatedUrl(undefined)).toBeUndefined();
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/')).toBeUndefined();
  });
});

describe('getSyncJobId', () => {
  it('should prefer current job id over last job id', () => {
    expect(
      getSyncJobId({
        current_job: { id: 10 },
        last_job: { id: 5 },
      })
    ).toBe(10);
  });

  it('should use current_update when summary job has no id', () => {
    expect(
      getSyncJobId({
        last_job: {},
        current_update: { id: 99 },
      })
    ).toBe(99);
  });

  it('should fall back to related last_job URL', () => {
    expect(getSyncJobId({ last_job: {} }, '/api/v2/inventory_updates/77/')).toBe(77);
  });
});
