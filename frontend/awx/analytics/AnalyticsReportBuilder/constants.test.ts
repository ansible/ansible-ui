import { describe, expect, it } from 'vitest';
import { categoryColor, reportDefaultParams, specificReportDefaultParams } from './constants';

describe('AnalyticsReportBuilder constants', () => {
  it('returns default params for a known report slug', () => {
    const params = specificReportDefaultParams('hosts_by_organization');
    expect(params.group_by).toBe('org');
    expect(params.quick_date_range).toBe('last_30_days');
  });

  it('wraps default params via reportDefaultParams', () => {
    const wrapped = reportDefaultParams('reports');
    expect(wrapped).toBeDefined();
  });

  it('maps task status keys to chart colors', () => {
    expect(categoryColor.ok).toBeDefined();
    expect(categoryColor.failed).toBeDefined();
  });
});
