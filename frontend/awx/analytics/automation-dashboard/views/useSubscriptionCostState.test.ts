import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import { Cache, SWRConfig } from 'swr';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useSubscriptionCostState } from './useSubscriptionCostState';
import type { ISubscriptionCosts } from '../types';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockUseGetReportSubscriptionCosts } = vi.hoisted(() => ({
  mockUseGetReportSubscriptionCosts: vi.fn(),
}));

vi.mock('./useGetReportSubscriptionCosts', () => ({
  SUBSCRIPTION_COSTS_URL: '/subscription_costs/',
  useGetReportSubscriptionCosts: mockUseGetReportSubscriptionCosts,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const fixture: ISubscriptionCosts[] = [
  {
    id: 1,
    monthly_subscription_cost: 100,
    engineer_avg_hourly_rate: 50,
    include_template_creation_time_in_costs: false,
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

/** Renders the hook seeded with fixture data, applies a local user edit and
 *  returns the hook handles plus the edited value for further assertions. */
async function setupWithUserEdit() {
  mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: fixture });
  const { result, rerender } = renderHook(() => useSubscriptionCostState());
  await waitFor(() => expect(result.current.costState).toEqual(fixture[0]));

  const userEdit: ISubscriptionCosts = { ...fixture[0], engineer_avg_hourly_rate: 75 };
  act(() => {
    result.current.setCostState(userEdit);
  });
  expect(result.current.costState).toEqual(userEdit);

  return { result, rerender, userEdit };
}

describe('useSubscriptionCostState', () => {
  beforeEach(() => {
    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: undefined });
  });

  test('should return costState as undefined and setCostState as function initially', () => {
    const { result } = renderHook(() => useSubscriptionCostState());

    expect(result.current.costState).toBeUndefined();
    expect(result.current.setCostState).toBeTypeOf('function');
  });

  test('should set costState when subscriptionCosts becomes defined', async () => {
    const { result, rerender } = renderHook(() => useSubscriptionCostState());
    expect(result.current.costState).toBeUndefined();

    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: fixture });
    rerender();

    await waitFor(() => expect(result.current.costState).toEqual(fixture[0]));
  });

  test('should not overwrite costState when subscriptionCosts becomes undefined', async () => {
    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: fixture });
    const { result, rerender } = renderHook(() => useSubscriptionCostState());

    await waitFor(() => expect(result.current.costState).toEqual(fixture[0]));

    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: undefined });
    rerender();

    expect(result.current.costState).toEqual(fixture[0]);
  });

  test('should preserve local costState edit when subscriptionCosts is unchanged (isPristine = false)', async () => {
    const { result, rerender, userEdit } = await setupWithUserEdit();

    // SWR refetches but returns the same subscriptionCosts reference — effects do not re-run.
    rerender();

    expect(result.current.costState).toEqual(userEdit);
  });

  test('should resync costState when subscriptionCosts changes after a local edit (confirmed save)', async () => {
    const { result, rerender } = await setupWithUserEdit();

    // Server confirms the save — subscriptionCosts changes to the saved value.
    const confirmed: ISubscriptionCosts = { ...fixture[0], engineer_avg_hourly_rate: 75 };
    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: [confirmed] });
    rerender();

    await waitFor(() => expect(result.current.costState).toEqual(confirmed));
  });

  test('should clear costState when subscriptionCosts becomes an empty array', async () => {
    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: fixture });
    const { result, rerender } = renderHook(() => useSubscriptionCostState());
    await waitFor(() => expect(result.current.costState).toEqual(fixture[0]));

    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: [] });
    rerender();

    await waitFor(() => expect(result.current.costState).toBeUndefined());
  });

  test('should clear costState when subscriptionCosts becomes an empty array even after a local edit', async () => {
    const { result, rerender } = await setupWithUserEdit();

    // Server returns empty array — local edit must be overwritten.
    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: [] });
    rerender();

    await waitFor(() => expect(result.current.costState).toBeUndefined());
  });

  describe('SWR list cache', () => {
    const CACHE_KEY = '/subscription_costs/';

    /** Renders the hook with an isolated SWR cache seeded with `cachedData`. */
    async function renderWithCache(cachedData: ISubscriptionCosts[] | undefined) {
      mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: fixture });
      const cache = new Map(
        cachedData ? [[CACHE_KEY, { data: cachedData }]] : []
      ) as unknown as Cache;
      const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(SWRConfig, { value: { provider: () => cache } }, children);
      const { result } = renderHook(() => useSubscriptionCostState(), { wrapper });
      await waitFor(() => expect(result.current.costState).toEqual(fixture[0]));
      const cachedData$ = () => (cache.get(CACHE_KEY) as { data?: unknown } | undefined)?.data;
      return { result, cachedData$ };
    }

    /** Lets any pending SWR cache mutation settle. */
    const flush = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

    test('should write the saved costs into the SWR cache of the list GET', async () => {
      const { result, cachedData$ } = await renderWithCache(fixture);

      const saved: ISubscriptionCosts = { ...fixture[0], monthly_subscription_cost: 500 };
      act(() => {
        result.current.setCostState(saved);
      });

      await waitFor(() => expect(cachedData$()).toEqual([saved]));
    });

    test('should replace only the cached record with the same id', async () => {
      const other: ISubscriptionCosts = { ...fixture[0], id: 2 };
      const { result, cachedData$ } = await renderWithCache([fixture[0], other]);

      const saved: ISubscriptionCosts = { ...fixture[0], monthly_subscription_cost: 500 };
      act(() => {
        result.current.setCostState(saved);
      });

      await waitFor(() => expect(cachedData$()).toEqual([saved, other]));
    });

    test('should leave the cache empty when nothing was cached yet', async () => {
      const { result, cachedData$ } = await renderWithCache(undefined);

      act(() => {
        result.current.setCostState({ ...fixture[0], monthly_subscription_cost: 500 });
      });
      await flush();

      expect(cachedData$()).toBeUndefined();
    });

    test('should not touch the cache for a functional update', async () => {
      const { result, cachedData$ } = await renderWithCache(fixture);
      const cachedBefore = cachedData$();

      act(() => {
        result.current.setCostState((prev) => prev && { ...prev, monthly_subscription_cost: 500 });
      });
      await flush();

      expect(result.current.costState?.monthly_subscription_cost).toBe(500);
      expect(cachedData$()).toBe(cachedBefore);
    });

    test('should not touch the cache when cleared to undefined', async () => {
      const { result, cachedData$ } = await renderWithCache(fixture);
      const cachedBefore = cachedData$();

      act(() => {
        result.current.setCostState(undefined);
      });
      await flush();

      expect(result.current.costState).toBeUndefined();
      expect(cachedData$()).toBe(cachedBefore);
    });
  });
});
