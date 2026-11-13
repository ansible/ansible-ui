import { describe, expect, test } from 'vitest';
import { getJobsDeepLinkQueryParams } from './jobsQueryParams';

describe('getJobsDeepLinkQueryParams', () => {
  test('preserves deep-link parameters that are not represented by Jobs toolbar filters', () => {
    expect(
      getJobsDeepLinkQueryParams(
        '?status=successful&type=job&organization=21&finished__gte=2026-11-01T00%3A00%3A00.000Z&finished__lte=2026-11-02T00%3A00%3A00.000Z&labels__id=11&labels__id=12&unified_job_template=31&unified_job_template__project=41'
      )
    ).toEqual({
      status: ['successful'],
      type: ['job'],
      organization: ['21'],
      unified_job_template: ['31'],
      finished__gte: ['2026-11-01T00:00:00.000Z'],
      finished__lte: ['2026-11-02T00:00:00.000Z'],
      labels__id: ['11', '12'],
    });
  });

  test('does not forward unrelated URL parameters', () => {
    expect(getJobsDeepLinkQueryParams('?page=2&project=41')).toEqual({});
  });
});
