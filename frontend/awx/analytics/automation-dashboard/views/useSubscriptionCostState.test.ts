import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useSubscriptionCostState } from './useSubscriptionCostState';
import type { ISubscriptionCosts } from '../types';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockUseGetReportSubscriptionCosts } = vi.hoisted(() => ({
  mockUseGetReportSubscriptionCosts: vi.fn(),
}));

vi.mock('./useGetReportSubscriptionCosts', () => ({
  useGetReportSubscriptionCosts: mockUseGetReportSubscriptionCosts,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const fixture: ISubscriptionCosts = {
  monthly_subscription_cost: 100,
  engineer_avg_hourly_rate: 50,
  include_template_creation_time_in_costs: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

/** Renders the hook seeded with fixture data, applies a local user edit and
 *  returns the hook handles plus the edited value for further assertions. */
async function setupWithUserEdit() {
  mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: fixture });
  const { result, rerender } = renderHook(() => useSubscriptionCostState());
  await waitFor(() => expect(result.current.costState).toEqual(fixture));

  const userEdit: ISubscriptionCosts = { ...fixture, engineer_avg_hourly_rate: 75 };
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

    await waitFor(() => expect(result.current.costState).toEqual(fixture));
  });

  test('should not overwrite costState when subscriptionCosts becomes undefined', async () => {
    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: fixture });
    const { result, rerender } = renderHook(() => useSubscriptionCostState());

    await waitFor(() => expect(result.current.costState).toEqual(fixture));

    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: undefined });
    rerender();

    expect(result.current.costState).toEqual(fixture);
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
    const confirmed: ISubscriptionCosts = { ...fixture, engineer_avg_hourly_rate: 75 };
    mockUseGetReportSubscriptionCosts.mockReturnValue({ subscriptionCosts: confirmed });
    rerender();

    await waitFor(() => expect(result.current.costState).toEqual(confirmed));
  });
});
