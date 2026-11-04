/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { computeMainFilterKeys, FillDefaultProps } from './AnalyticsReportBuilder';

describe('AnalyticsReportBuilder helpers', () => {
  it('sets default rowKeyFn when missing', () => {
    const props: {
      report_name: string;
      main_url: string;
      rowKeyFn?: (row: { id: number }) => number;
    } = { report_name: 'hosts_by_organization', main_url: '/test/' };
    FillDefaultProps(props as never);
    expect(props.rowKeyFn?.({ id: 99 })).toBe(99);
  });

  it('maps group_by options to filter keys', () => {
    const keys = computeMainFilterKeys({
      options: { group_by: [{ key: 'org', value: 'Organization' }] },
    } as never);
    expect(keys).toEqual([{ key: 'org_id', value: 'Organization' }]);
  });

  it('derives filter keys ending in _id from options', () => {
    const keys = computeMainFilterKeys({
      defaultDataParams: {},
      options: { org_id: [], cluster_id: [] },
    } as never);
    expect(keys.map((item) => item.key).sort()).toEqual(['cluster_id', 'org_id']);
  });

  it('returns empty list when options and defaults are missing', () => {
    expect(computeMainFilterKeys({} as never)).toEqual([]);
  });
});
