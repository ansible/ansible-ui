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
    expect(getSyncJobId({})).toBeUndefined();
    expect(getSyncJobId({ current_job: {}, last_job: {} }, '')).toBeUndefined();
  });

  it('should handle zero as invalid ID', () => {
    expect(getSyncJobId({}, '/api/v2/inventory_updates/0/')).toBeUndefined();
  });

  it('should handle negative numbers as invalid IDs', () => {
    expect(getSyncJobId({}, '/api/v2/inventory_updates/-5/')).toBeUndefined();
  });

  it('should return current_job ID when both current_job and last_job exist', () => {
    expect(
      getSyncJobId({
        current_job: { id: 100 },
        last_job: { id: 50 },
      })
    ).toBe(100);
  });

  it('should skip to last_job when current_job is null', () => {
    expect(
      getSyncJobId({
        current_job: null,
        last_job: { id: 75 },
      })
    ).toBe(75);
  });

  it('should skip to current_update when neither current_job nor last_job have ids', () => {
    expect(
      getSyncJobId({
        current_job: {},
        last_job: {},
        current_update: { id: 150 },
      })
    ).toBe(150);
  });

  it('should use URL as last resort', () => {
    expect(
      getSyncJobId(
        {
          current_job: {},
          last_job: {},
          current_update: {},
        },
        '/api/v2/inventory_updates/200/'
      )
    ).toBe(200);
  });

  it('should handle all empty summary fields with valid URL', () => {
    expect(getSyncJobId({}, '/api/v2/job_templates/10/')).toBe(10);
  });

  it('should prefer current_job.id even when it is the only value', () => {
    expect(getSyncJobId({ current_job: { id: 11 } })).toBe(11);
  });

  it('should fallback to last_job.id when current_job is undefined', () => {
    expect(getSyncJobId({ current_job: undefined, last_job: { id: 22 } })).toBe(22);
  });

  it('should fallback to current_update.id when both jobs exist but have no id', () => {
    expect(
      getSyncJobId({
        current_job: {},
        last_job: {},
        current_update: { id: 33 },
      })
    ).toBe(33);
  });

  it('should parse URL correctly when all summary fields are empty', () => {
    expect(
      getSyncJobId(
        { current_job: {}, last_job: {}, current_update: {} },
        '/api/v2/inventory_updates/44/'
      )
    ).toBe(44);
  });

  it('should return undefined when all fields are null or missing', () => {
    expect(getSyncJobId({ current_job: null, last_job: null }, null)).toBeUndefined();
  });

  it('should handle mixed null and undefined in summary fields', () => {
    expect(getSyncJobId({ current_job: null, last_job: undefined })).toBeUndefined();
  });

  it('should extract large ID numbers from URL', () => {
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/999999999/')).toBe(999999999);
  });

  it('should reject non-integer decimals correctly', () => {
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/1.5/')).toBeUndefined();
    expect(getIdFromAwxRelatedUrl('/api/v2/inventory_updates/9.99/')).toBeUndefined();
  });

  it('should handle empty string URL', () => {
    expect(getIdFromAwxRelatedUrl('')).toBeUndefined();
  });

  it('should handle URL with only slashes', () => {
    expect(getIdFromAwxRelatedUrl('///')).toBeUndefined();
  });

  it('should prioritize current_job over all other fallbacks', () => {
    expect(
      getSyncJobId(
        {
          current_job: { id: 1 },
          last_job: { id: 2 },
          current_update: { id: 3 },
        },
        '/api/v2/inventory_updates/4/'
      )
    ).toBe(1);
  });

  it('should prioritize last_job over current_update and URL', () => {
    expect(
      getSyncJobId(
        {
          current_job: null,
          last_job: { id: 5 },
          current_update: { id: 6 },
        },
        '/api/v2/inventory_updates/7/'
      )
    ).toBe(5);
  });

  it('should prioritize current_update over URL', () => {
    expect(
      getSyncJobId(
        {
          current_job: {},
          last_job: {},
          current_update: { id: 8 },
        },
        '/api/v2/inventory_updates/9/'
      )
    ).toBe(8);
  });
});
