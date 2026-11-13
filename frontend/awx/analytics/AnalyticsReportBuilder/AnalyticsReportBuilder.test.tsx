import { describe, expect, it, vi } from 'vitest';
import {
  computeMainFilterKeys,
  FillDefaultProps,
  type AnalyticsReportBuilderBodyProps,
  type AnalyticsReportBuilderProps,
  type OptionsDefinition,
} from './AnalyticsReportBuilder';

const navigateStub = vi.fn() as AnalyticsReportBuilderProps['navigate'];

const baseBuilderProps: AnalyticsReportBuilderProps = {
  report_name: 'hosts_by_organization',
  main_url: '/test/',
  navigate: navigateStub,
};

const emptyOptions: OptionsDefinition = {
  sort_options: [],
  group_by: [],
  quick_date_range: [],
  granularity: [],
};

describe('AnalyticsReportBuilder helpers', () => {
  it('sets default rowKeyFn when missing', () => {
    const props: AnalyticsReportBuilderProps = { ...baseBuilderProps };
    FillDefaultProps(props);
    expect(props.rowKeyFn?.({ id: 99 })).toBe(99);
  });

  it('maps group_by options to filter keys', () => {
    const params: AnalyticsReportBuilderBodyProps = {
      ...baseBuilderProps,
      options: {
        ...emptyOptions,
        group_by: [{ key: 'org', value: 'Organization' }],
      },
    };
    const keys = computeMainFilterKeys(params);
    expect(keys).toEqual([{ key: 'org_id', value: 'Organization' }]);
  });

  it('derives filter keys ending in _id from options', () => {
    const params: AnalyticsReportBuilderBodyProps = {
      ...baseBuilderProps,
      defaultDataParams: {},
      options: {
        ...emptyOptions,
        org_id: [],
        cluster_id: [],
      },
    };
    const keys = computeMainFilterKeys(params);
    expect(keys.map((item) => item.key).sort((a, b) => a.localeCompare(b))).toEqual([
      'cluster_id',
      'org_id',
    ]);
  });

  it('returns empty list when options and defaults are missing', () => {
    const params: AnalyticsReportBuilderBodyProps = { ...baseBuilderProps };
    expect(computeMainFilterKeys(params)).toEqual([]);
  });

  it('collects every *_id option when group_by is not provided', () => {
    const params: AnalyticsReportBuilderBodyProps = {
      ...baseBuilderProps,
      defaultDataParams: { inventory_id: ['9'] },
      options: {
        ...emptyOptions,
        inventory_id: [],
        template_id: [],
      },
    };
    const keys = computeMainFilterKeys(params);
    expect(keys.map((item) => item.key).sort((a, b) => a.localeCompare(b))).toEqual([
      'inventory_id',
      'template_id',
    ]);
  });
});
