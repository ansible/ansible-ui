import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, test, expect, vi } from 'vitest';
import { ToolbarFilterType } from '../../../../../framework';
import { useGetReportDetails } from './useGetReportDetails';
import type { IDashboardDetails } from '../types';
import type { IFilterState, IToolbarFilter } from '../../../../../framework';
import { metricsAPI } from '../../../common/api/metrics-utils';
import {
  dashboardDetailsFromJobs,
  dashboardLabelAggregationJobs,
  getLabelFilteredJobs,
} from './useGetReportDetails.fixtures';

const dashboardDetailsFixture: IDashboardDetails = {
  total_number_of_successful_jobs: 10,
  total_number_of_failed_jobs: 2,
  total_number_of_unique_hosts: 5,
  cost_of_automated_execution: 100,
  cost_of_manual_automation: 200,
  total_hours_of_automation: 50,
  total_saving: 100,
  total_time_saving: 20,
  total_number_of_host_job_runs: 15,
  total_number_of_job_runs: 12,
  top_projects: [{ id: 1, name: 'Project X', execution_count: 8 }],
  top_users: [{ id: 1, name: 'admin', execution_count: 10 }],
  job_chart: { kind: 'day', items: [{ label: 'Mon', value: 3 }] },
  host_chart: { kind: 'day', items: [{ label: 'Mon', value: 2 }] },
};

/** The JSON body of a report query. */
type ReportBody = Record<string, unknown>;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * SWR retrying as in the app (the test setup turns retries off), with its own cache and a short
 * retry interval, so retries would happen within a test.
 */
function FastRetrySWRConfig(props: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        errorRetryInterval: 10,
        dedupingInterval: 0,
        shouldRetryOnError: true,
      }}
    >
      {props.children}
    </SWRConfig>
  );
}

describe('useGetReportDetails', () => {
  describe('Loading state', () => {
    test('should return isLoading true while fetching data', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([], {}));

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe('Success state', () => {
    test('should return report details when data is fetched', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () =>
          HttpResponse.json(dashboardDetailsFixture)
        )
      );

      const { result } = renderHook(() => useGetReportDetails([], {}));

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(result.current.reportDetails).toEqual(dashboardDetailsFixture);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    test('should expose a refresh function', async () => {
      let callCount = 0;
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () => {
          callCount += 1;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([], {}));

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(result.current.refreshDetails).toBeTypeOf('function');
      await act(async () => {
        await result.current.refreshDetails();
      });
      await waitFor(() => expect(callCount).toBe(2));
    });
  });

  describe('Error state', () => {
    test('should return error when API returns 500', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      const { result } = renderHook(() => useGetReportDetails([], {}));

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.reportDetails).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    test('should return error when API returns 404', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () =>
          HttpResponse.json({ detail: 'Not Found' }, { status: 404 })
        )
      );

      const { result } = renderHook(() => useGetReportDetails([], {}));

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.reportDetails).toBeUndefined();
    });
  });

  describe('Too large requests', () => {
    test('should not retry a request rejected as too large', async () => {
      let requestCount = 0;
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () => {
          requestCount += 1;
          return HttpResponse.json({}, { status: 431 });
        })
      );
      const { result } = renderHook(() => useGetReportDetails([], {}), {
        wrapper: FastRetrySWRConfig,
      });
      await waitFor(() => expect(result.current.error).toBeDefined());

      await act(() => new Promise((resolve) => setTimeout(resolve, 300)));

      expect(requestCount).toBe(1);
    });
  });

  describe('Request', () => {
    test('should return label-filtered counts without retroactively including earlier runs', async () => {
      const labelFilter: IToolbarFilter = {
        key: 'label',
        label: 'Label',
        type: ToolbarFilterType.AsyncMultiSelect,
        query: 'label',
        placeholder: 'Select Label',
        queryOptions: vi.fn(),
        queryLabel: vi.fn(),
      };
      const organizationFilter: IToolbarFilter = {
        key: 'organization',
        label: 'Organization',
        type: ToolbarFilterType.AsyncMultiSelect,
        query: 'organization',
        placeholder: 'Select Organization',
        queryOptions: vi.fn(),
        queryLabel: vi.fn(),
      };
      const periodFilter: IToolbarFilter = {
        key: 'period',
        label: 'Period',
        type: ToolbarFilterType.DateRange,
        query: 'period',
        placeholder: 'Select Period',
        options: [{ label: 'Custom', value: 'custom', isCustom: true }],
      };
      const start = '2026-11-01T00:00:00.000Z';
      const end = '2026-11-12T23:59:59.999Z';
      const expectedJobs = getLabelFilteredJobs(dashboardLabelAggregationJobs, {
        labelId: 42,
        start,
        end,
        organizationIds: [1, 2],
      });
      let capturedBody: ReportBody = {};

      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, async ({ request }) => {
          capturedBody = (await request.json()) as ReportBody;
          const jobs = getLabelFilteredJobs(dashboardLabelAggregationJobs, {
            labelId: (capturedBody.label as number[])[0],
            start,
            end,
            organizationIds: capturedBody.organization as number[],
          });
          return HttpResponse.json(dashboardDetailsFromJobs(jobs));
        })
      );

      const { result } = renderHook(() =>
        useGetReportDetails(
          [labelFilter, organizationFilter, periodFilter],
          {
            label: ['42'],
            organization: ['1', '2'],
            period: ['custom', '2026-11-01', '2026-11-12'],
          },
          { tz: 'UTC' }
        )
      );

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(capturedBody.label).toEqual([42]);
      expect(capturedBody.organization).toEqual([1, 2]);
      expect(result.current.reportDetails?.total_number_of_successful_jobs).toBe(
        expectedJobs.filter((job) => job.status === 'successful').length
      );
      expect(result.current.reportDetails?.total_number_of_failed_jobs).toBe(
        expectedJobs.filter((job) => job.status === 'failed').length
      );
      expect(expectedJobs.map((job) => job.id)).toEqual([1002, 1003]);
    });

    test('should call the correct API endpoint', async () => {
      let capturedUrl = '';

      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([], {}));

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(capturedUrl).toContain('dashboard_reports/report/details/query/');
    });

    test('should send the query params and the selection in the body', async () => {
      let capturedBody: ReportBody = {};
      const templateFilter: IToolbarFilter = {
        key: 'template',
        label: 'Template',
        type: ToolbarFilterType.AsyncMultiSelect,
        query: 'template',
        placeholder: 'Select Template',
        queryOptions: vi.fn(),
        queryLabel: vi.fn(),
      };
      const filterState: IFilterState = {
        search_template: ['deploy'],
        excluded_search_template: ['test'],
        template: ['5'],
      };

      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, async ({ request }) => {
          capturedBody = (await request.json()) as ReportBody;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() =>
        useGetReportDetails([templateFilter], filterState, { tz: 'Europe/Ljubljana' })
      );

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(capturedBody).toEqual({
        tz: 'Europe/Ljubljana',
        template: [5],
        search_template: ['deploy'],
        excluded_search_template: ['test'],
      });
    });
  });

  describe('Required filters validation', () => {
    const requiredDateRangeFilter: IToolbarFilter = {
      type: ToolbarFilterType.DateRange,
      key: 'period',
      label: 'Period',
      query: 'period',
      options: [
        { label: 'Last 7 days', value: 'last_7_days' },
        { label: 'Custom', value: 'custom', isCustom: true },
      ],
      placeholder: 'Filter by period',
      isRequired: true,
    };

    test('should not fetch when required filter has no value', async () => {
      let requestReceived = false;
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () => {
          requestReceived = true;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([requiredDateRangeFilter], {}));

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(requestReceived).toBe(false);
      expect(result.current.reportDetails).toBeUndefined();
    });

    test('should not fetch when custom date range start date is not ISO formatted', async () => {
      let requestReceived = false;
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () => {
          requestReceived = true;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() =>
        useGetReportDetails([requiredDateRangeFilter], { period: ['custom', '01/01/2024'] })
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(requestReceived).toBe(false);
      expect(result.current.reportDetails).toBeUndefined();
    });

    test('should fetch when custom date range has a valid ISO start date only', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () =>
          HttpResponse.json(dashboardDetailsFixture)
        )
      );

      const { result } = renderHook(() =>
        useGetReportDetails([requiredDateRangeFilter], { period: ['custom', '2024-01-01'] })
      );

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());
    });

    test('should fetch when custom date range has valid ISO start and end dates', async () => {
      server.use(
        http.post(metricsAPI`/dashboard_reports/report/details/query/`, () =>
          HttpResponse.json(dashboardDetailsFixture)
        )
      );

      const { result } = renderHook(() =>
        useGetReportDetails([requiredDateRangeFilter], {
          period: ['custom', '2024-01-01', '2024-01-31'],
        })
      );

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());
    });
  });
});
