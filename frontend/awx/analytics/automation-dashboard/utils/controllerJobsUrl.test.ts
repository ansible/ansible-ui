import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';
import { getControllerJobsUrl } from './controllerJobsUrl';

const NOW = DateTime.fromISO('2026-11-12T18:00:00.000Z');

describe('getControllerJobsUrl', () => {
  test('should preserve status when no optional filters are active', () => {
    const params = new URL(
      getControllerJobsUrl('successful', undefined, 'UTC', NOW),
      'https://example.test'
    ).searchParams;

    expect(params.get('status')).toBe('successful');
    expect(params.get('type')).toBe('job');
    expect(params.get('finished__gte')).toBeNull();
    expect(params.get('finished__lte')).toBeNull();
  });

  test('should map dashboard IDs to Controller filter parameters', () => {
    const params = new URL(
      getControllerJobsUrl(
        'failed',
        {
          period: ['last_7_days'],
          label: ['11', '12'],
          organization: ['21'],
          template: ['31'],
          project: ['41'],
        },
        'UTC',
        NOW
      ),
      'https://example.test'
    ).searchParams;

    expect(params.get('status')).toBe('failed');
    expect(params.getAll('labels__id')).toEqual(['11', '12']);
    expect(params.get('organization')).toBe('21');
    expect(params.get('unified_job_template')).toBe('31');
    expect(params.get('unified_job_template__project')).toBe('41');
    expect(params.get('finished__gte')).toBe('2026-11-05T18:00:00.000Z');
    expect(params.get('finished__lte')).toBe('2026-11-12T18:00:00.000Z');
  });

  test('should convert custom local dates to UTC day boundaries', () => {
    const params = new URL(
      getControllerJobsUrl(
        'successful',
        { period: ['custom', '2026-11-01', '2026-11-02'] },
        'America/Chicago',
        NOW
      ),
      'https://example.test'
    ).searchParams;

    expect(params.get('finished__gte')).toBe('2026-11-01T05:00:00.000Z');
    expect(params.get('finished__lte')).toBe('2026-11-03T05:59:59.999Z');
  });

  test('should default a custom period without an end date to the current local day', () => {
    const params = new URL(
      getControllerJobsUrl(
        'successful',
        { period: ['custom', '2026-11-01'] },
        'America/Chicago',
        NOW
      ),
      'https://example.test'
    ).searchParams;

    expect(params.get('finished__gte')).toBe('2026-11-01T05:00:00.000Z');
    expect(params.get('finished__lte')).toBe('2026-11-13T05:59:59.999Z');
  });

  test('should omit malformed date bounds instead of creating an invalid link', () => {
    const params = new URL(
      getControllerJobsUrl(
        'successful',
        { period: ['custom', 'not-a-date', '2026-11-02'] },
        'UTC',
        NOW
      ),
      'https://example.test'
    ).searchParams;

    expect(params.get('status')).toBe('successful');
    expect(params.get('finished__gte')).toBeNull();
    expect(params.get('finished__lte')).toBeNull();
  });
});
