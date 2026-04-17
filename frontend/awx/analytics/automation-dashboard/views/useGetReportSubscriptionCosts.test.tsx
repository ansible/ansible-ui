import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { useGetReportSubscriptionCosts } from './useGetReportSubscriptionCosts';
import type { ISubscriptionCosts } from '../types';
import { metricsAPI } from '../../../common/api/metrics-utils';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const subscriptionCostsFixture: ISubscriptionCosts[] = [
  {
    id: 1,
    monthly_subscription_cost: 100,
    engineer_avg_hourly_rate: 50,
    include_template_creation_time_in_costs: false,
  },
];

// ─── Wrapper ──────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useGetReportSubscriptionCosts', () => {
  describe('Loading state', () => {
    test('should return isLoading true while fetching data', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/subscription_costs/`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return HttpResponse.json(subscriptionCostsFixture);
        })
      );

      const { result } = renderHook(() => useGetReportSubscriptionCosts(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe('Success state', () => {
    test('should return subscription costs when data is fetched', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/subscription_costs/`, () =>
          HttpResponse.json(subscriptionCostsFixture)
        )
      );

      const { result } = renderHook(() => useGetReportSubscriptionCosts(), { wrapper });

      await waitFor(() => expect(result.current.subscriptionCosts).toBeDefined());

      expect(result.current.subscriptionCosts).toEqual(subscriptionCostsFixture);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    test('should expose a refresh function', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/subscription_costs/`, () =>
          HttpResponse.json(subscriptionCostsFixture)
        )
      );

      const { result } = renderHook(() => useGetReportSubscriptionCosts(), { wrapper });

      await waitFor(() => expect(result.current.subscriptionCosts).toBeDefined());

      expect(result.current.refresh).toBeTypeOf('function');
    });
  });

  describe('Error state', () => {
    test('should return error when API returns 500', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/subscription_costs/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      const { result } = renderHook(() => useGetReportSubscriptionCosts(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.subscriptionCosts).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
