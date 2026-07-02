import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, test, expect } from 'vitest';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { ToolbarFilterType } from '../../../../../framework';
import { useGetReportDetails } from './useGetReportDetails';
import type { IDashboardDetails } from '../types';
import type { IFilterState, IToolbarFilter } from '../../../../../framework';
import { metricsAPI } from '../../../common/api/metrics-utils';

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
  top_projects: [{ id: 1, name: 'Project 1', execution_count: 5 }],
  top_users: [{ id: 1, name: 'User 1', execution_count: 3 }],
  job_chart: { kind: 'day', items: [{ label: 'Mon', value: 3 }] },
  host_chart: { kind: 'day', items: [{ label: 'Mon', value: 2 }] },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useGetReportDetails', () => {
  describe('Loading state', () => {
    test('should return isLoading true while fetching data', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([], {}), { wrapper });

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe('Success state', () => {
    test('should return report details when data is fetched', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, () =>
          HttpResponse.json(dashboardDetailsFixture)
        )
      );

      const { result } = renderHook(() => useGetReportDetails([], {}), { wrapper });

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(result.current.reportDetails).toEqual(dashboardDetailsFixture);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    test('should expose a refresh function', async () => {
      let callCount = 0;
      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, () => {
          callCount += 1;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([], {}), { wrapper });

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
        http.get(metricsAPI`/dashboard_reports/report/details/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      const { result } = renderHook(() => useGetReportDetails([], {}), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.reportDetails).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    test('should return error when API returns 404', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, () =>
          HttpResponse.json({ detail: 'Not Found' }, { status: 404 })
        )
      );

      const { result } = renderHook(() => useGetReportDetails([], {}), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.reportDetails).toBeUndefined();
    });
  });

  describe('URL construction', () => {
    test('should call the correct API endpoint', async () => {
      let capturedUrl = '';

      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([], {}), { wrapper });

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(capturedUrl).toContain('dashboard_reports/report/details/');
    });

    test('should include queryParams in the URL', async () => {
      let capturedUrl = '';

      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([], {}, { tz: 'Europe/Ljubljana' }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(new URL(capturedUrl).searchParams.get('tz')).toBe('Europe/Ljubljana');
    });

    test('should include filter state params in the URL', async () => {
      let capturedUrl = '';

      const nameFilter: IToolbarFilter = {
        key: 'template_name',
        label: 'Name',
        type: ToolbarFilterType.MultiText,
        query: 'template_name',
        comparison: 'contains',
        placeholder: 'Filter by name',
      };
      const filterState: IFilterState = { template_name: ['my-template'] };

      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([nameFilter], filterState), {
        wrapper,
      });

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      expect(new URL(capturedUrl).searchParams.get('template_name')).toBe('my-template');
    });

    test('should combine queryParams and filter state in the URL', async () => {
      let capturedUrl = '';

      const nameFilter: IToolbarFilter = {
        key: 'template_name',
        label: 'Name',
        type: ToolbarFilterType.MultiText,
        query: 'template_name',
        comparison: 'contains',
        placeholder: 'Filter by name',
      };
      const filterState: IFilterState = { template_name: ['automation-job'] };

      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(
        () => useGetReportDetails([nameFilter], filterState, { tz: 'UTC' }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());

      const url = new URL(capturedUrl);
      expect(url.searchParams.get('tz')).toBe('UTC');
      expect(url.searchParams.get('template_name')).toBe('automation-job');
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
        http.get(metricsAPI`/dashboard_reports/report/details/`, () => {
          requestReceived = true;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportDetails([requiredDateRangeFilter], {}), {
        wrapper,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(requestReceived).toBe(false);
      expect(result.current.reportDetails).toBeUndefined();
    });

    test('should not fetch when custom date range start date is not ISO formatted', async () => {
      let requestReceived = false;
      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, () => {
          requestReceived = true;
          return HttpResponse.json(dashboardDetailsFixture);
        })
      );

      const { result } = renderHook(
        () => useGetReportDetails([requiredDateRangeFilter], { period: ['custom', '01/01/2024'] }),
        { wrapper }
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(requestReceived).toBe(false);
      expect(result.current.reportDetails).toBeUndefined();
    });

    test('should fetch when custom date range has a valid ISO start date only', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, () =>
          HttpResponse.json(dashboardDetailsFixture)
        )
      );

      const { result } = renderHook(
        () => useGetReportDetails([requiredDateRangeFilter], { period: ['custom', '2024-01-01'] }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());
    });

    test('should fetch when custom date range has valid ISO start and end dates', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/report/details/`, () =>
          HttpResponse.json(dashboardDetailsFixture)
        )
      );

      const { result } = renderHook(
        () =>
          useGetReportDetails([requiredDateRangeFilter], {
            period: ['custom', '2024-01-01', '2024-01-31'],
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.reportDetails).toBeDefined());
    });
  });
});
