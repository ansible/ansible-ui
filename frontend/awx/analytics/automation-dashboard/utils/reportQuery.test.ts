import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { describe, expect, it, vi } from 'vitest';
import { getReportPageQueryString, getReportQueryBody } from './reportQuery';

function asyncFilter(key: string): IToolbarFilter {
  return {
    type: ToolbarFilterType.AsyncMultiSelect,
    key,
    label: key,
    query: key,
    placeholder: key,
    queryOptions: vi.fn(),
    queryLabel: vi.fn(),
  };
}

const periodFilter: IToolbarFilter = {
  type: ToolbarFilterType.DateRange,
  key: 'period',
  label: 'Period',
  query: 'period',
  options: [{ label: 'Custom', value: 'custom', isCustom: true }],
  placeholder: 'Period',
};

describe('getReportQueryBody', () => {
  it('describes the selection of every filter with the selection parameters', () => {
    const body = getReportQueryBody(
      [periodFilter, asyncFilter('template'), asyncFilter('label'), asyncFilter('project')],
      {
        period: ['custom', '2026-10-01', '2026-10-31'],
        select_all_template: ['true'],
        excluded_template: ['4', '7'],
        excluded_search_template: ['test%2Cqa'],
        label: ['1', '2'],
        search_label: ['prod'],
      },
      { tz: 'Europe/Ljubljana' }
    );

    expect(body).toEqual({
      tz: 'Europe/Ljubljana',
      period: 'custom',
      start_date: '2026-10-01',
      end_date: '2026-10-31',
      select_all_template: true,
      excluded_template: [4, 7],
      excluded_search_template: ['test,qa'],
      label: [1, 2],
      search_label: ['prod'],
    });
  });

  it('sends the filter under its API field and drops values that are no ID', () => {
    const filter = { ...asyncFilter('templates'), query: 'template' };

    expect(getReportQueryBody([filter], { templates: ['1', 'x', '2'] })).toEqual({
      template: [1, 2],
    });
  });

  it('leaves out filters without a selection, values of unknown filters and exclusions alone', () => {
    expect(
      getReportQueryBody([asyncFilter('template')], {
        excluded_template: ['1'],
        unknown: ['1'],
      })
    ).toEqual({});
  });

  it('adds the extra values, e.g. of the CSV export', () => {
    expect(getReportQueryBody([], {}, {}, { report_type: 'roi', export_format: 'csv' })).toEqual({
      report_type: 'roi',
      export_format: 'csv',
    });
  });
});

describe('getReportPageQueryString', () => {
  it('has the page, its size and the ordering', () => {
    expect(
      getReportPageQueryString({ page: 2, perPage: 20, sort: 'runs', sortDirection: 'desc' })
    ).toBe('?order_by=-runs&page=2&page_size=20');
    expect(getReportPageQueryString({ page: 1, perPage: 10, sort: '', sortDirection: 'asc' })).toBe(
      '?page=1&page_size=10'
    );
  });
});
