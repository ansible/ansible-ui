import { describe, expect, it } from 'vitest';
import { getIdFromAwxRelatedUrl, getSyncJobId } from './getSyncJobId';

describe('getIdFromAwxRelatedUrl', () => {
  it('should parse id from a related job URL', () => {
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/123/')).toBe(123);
    expect(getIdFromAwxRelatedUrl('/api/controller/v2/project_updates/42')).toBe(42);
  });

  it('should return undefined for empty or invalid values', () => {
    expect(getIdFromAwxRelatedUrl()).toBeUndefined();
    expect(getIdFromAwxRelatedUrl(null)).toBeUndefined();
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/')).toBeUndefined();
  });

  it('should handle URLs with varying trailing slash patterns', () => {
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/999/')).toBe(999);
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/888')).toBe(888);
  });

  it('should return undefined for non-numeric IDs', () => {
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/abc/')).toBeUndefined();
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/12.34/')).toBeUndefined();
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

  it('should use last_job when current_job is missing or has no id', () => {
    expect(
      getSyncJobId({
        last_job: { id: 5 },
      })
    ).toBe(5);
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

  it('should handle undefined summary fields', () => {
    expect(getSyncJobId()).toBeUndefined();
    expect(getSyncJobId(null)).toBeUndefined();
  });

  it('should prefer summary fields over related URL', () => {
    expect(getSyncJobId({ current_job: { id: 50 } }, '/api/v2/inventory_updates/100/')).toBe(50);
  });

  it('should return undefined when no data available', () => {
    expect(getSyncJobId({}, undefined)).toBeUndefined();
    expect(getSyncJobId({ current_job: {}, last_job: {} }, '')).toBeUndefined();
  });
});
