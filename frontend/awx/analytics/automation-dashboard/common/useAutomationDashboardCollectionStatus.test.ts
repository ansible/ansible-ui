/* eslint-disable i18next/no-literal-string */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('swr');
vi.mock('../../../../../platform/main/PlatformActiveUserProvider');
vi.mock('../../../common/api/metrics-utils', () => ({
  metricsAPI: (strings: TemplateStringsArray, ...values: string[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), ''),
}));
vi.mock('../../../../common/crud/Data');

import useSWR from 'swr';
import { usePlatformActiveUser } from '@ansible/platform-ui/main/PlatformActiveUserProvider';
import { useFetcher } from '../../../../common/crud/Data';
import { useAutomationDashboardCollectionStatus } from './useAutomationDashboardCollectionStatus';
import { IAutomationDashboardCollectionStatus } from '../types';

const DEFAULT_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: null,
  last_sync: null,
  show_dashboard: null,
  show_leaderboard: null,
};

function setupActiveUser({
  is_superuser = false,
  is_platform_auditor = false,
}: {
  is_superuser?: boolean;
  is_platform_auditor?: boolean;
} = {}) {
  vi.mocked(usePlatformActiveUser).mockReturnValue({
    activePlatformUser: {
      is_superuser,
      is_platform_auditor,
      id: 0,
      url: '',
      created: '',
      created_by: '',
      modified: '',
      modified_by: '',
      related: {},
      summary_fields: {
        modified_by: {
          id: 0,
          username: '',
          first_name: '',
          last_name: '',
        },
        created_by: {
          id: 0,
          username: '',
          first_name: '',
          last_name: '',
        },
        resource: {
          ansible_id: '',
          resource_type: '',
        },
      },
      username: '',
      last_login_map_results: [],
      managed: false,
    },
    refreshActivePlatformUser: vi.fn(),
  });
}

function setupActiveUserUndefined() {
  vi.mocked(usePlatformActiveUser).mockReturnValue({
    activePlatformUser: undefined,
    refreshActivePlatformUser: vi.fn(),
  });
}

function setupActiveUserNull() {
  vi.mocked(usePlatformActiveUser).mockReturnValue({
    activePlatformUser: null,
    refreshActivePlatformUser: vi.fn(),
  });
}

function setupSWR(data?: IAutomationDashboardCollectionStatus, error?: Error) {
  vi.mocked(useSWR).mockReturnValue({
    data,
    error,
    mutate: vi.fn(),
    isValidating: false,
    isLoading: !data && !error,
  });
}

describe('useAutomationDashboardCollectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFetcher).mockReturnValue(vi.fn());
  });

  describe('when user is not superuser or auditor', () => {
    test('should return default status and not fetch', () => {
      setupActiveUser({ is_superuser: false, is_platform_auditor: false });
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
      // SWR should be called with null key (no fetch)
      expect(vi.mocked(useSWR).mock.calls[0][0]).toBeNull();
    });
  });

  describe('when activePlatformUser is undefined (still loading)', () => {
    test('should return default status and not fetch', () => {
      setupActiveUserUndefined();
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
      expect(vi.mocked(useSWR).mock.calls[0][0]).toBeNull();
    });
  });

  describe('when activePlatformUser is null (not logged in)', () => {
    test('should return default status and not fetch', () => {
      setupActiveUserNull();
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
      expect(vi.mocked(useSWR).mock.calls[0][0]).toBeNull();
    });
  });

  describe('when user is superuser', () => {
    test('should return default status when data is undefined', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(true);
    });

    test('should return data from API when available', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        next_run: '2026-05-01T00:00:00Z',
        initial_collection_status: 'completed',
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.isLoading).toBe(false);
    });

    test('should pass through min_collection_timestamp from the API response', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        next_run: null,
        initial_collection_status: 'completed',
        min_collection_timestamp: '2026-09-01T14:00:00.000Z',
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus.min_collection_timestamp).toBe(
        '2026-09-01T14:00:00.000Z'
      );
    });

    test('should return default status on error', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR(undefined, new Error('Network error'));

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
    });

    test('should return default status when both data and error exist (revalidation failure)', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        next_run: '2026-05-01T00:00:00Z',
        initial_collection_status: 'completed',
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData, new Error('Revalidation failed'));

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
    });

    test('should fetch using the metrics API URL', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR();

      renderHook(() => useAutomationDashboardCollectionStatus());

      const swrKey = vi.mocked(useSWR).mock.calls[0][0];
      expect(typeof swrKey).toBe('string');
      expect(swrKey as string).toContain('dashboard_reports/collection_status');
    });

    test('should pass the fetcher function as second argument to SWR', () => {
      const mockFetcherFn = vi.fn();
      vi.mocked(useFetcher).mockReturnValue(mockFetcherFn);
      setupActiveUser({ is_superuser: true });
      setupSWR();

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(useSWR).mock.calls[0][1]).toBe(mockFetcherFn);
    });

    test('should pass dedupingInterval and refreshInterval options to SWR', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR();

      renderHook(() => useAutomationDashboardCollectionStatus());

      const options = vi.mocked(useSWR).mock.calls[0][2];
      expect(options).toMatchObject({ dedupingInterval: 0, refreshInterval: 10 * 1000 });
    });
  });

  describe('when user is platform auditor', () => {
    test('should fetch and return data', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: '2026-09-01T14:00:00.000Z',
        show_dashboard: true,
        show_leaderboard: false,
      };
      setupActiveUser({ is_superuser: false, is_platform_auditor: true });
      setupSWR(apiData);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.isLoading).toBe(false);
    });

    test('should return default status on error', () => {
      setupSWR(undefined, new Error('Network error'));

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });

    test('should keep the last good data and hide the error when a revalidation fails', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      };
      setupSWR(apiData, new Error('Revalidation failed'));

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('canSeeDashboard / canSeeLeaderboard', () => {
    test('should allow a superuser to see the dashboard when show_dashboard is true', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR({
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(true);
    });

    test('should allow a system auditor to see the dashboard when show_dashboard is true', () => {
      setupActiveUser({ is_system_auditor: true });
      setupSWR({
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(true);
    });

    test('should allow a platform auditor to see the dashboard when show_dashboard is true', () => {
      setupActiveUser({ is_superuser: false, is_system_auditor: false });
      setupPlatformUser({ is_platform_auditor: true });
      setupSWR({
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(true);
    });

    test('should not allow a regular user to see the dashboard even when show_dashboard is true', () => {
      setupActiveUser({ is_superuser: false, is_system_auditor: false });
      setupSWR({
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(false);
    });

    test('should not allow a superuser to see the dashboard when show_dashboard is false', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR({
        enabled: true,
        last_sync: null,
        show_dashboard: false,
        show_leaderboard: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(false);
    });

    test('should allow a regular user to see leaderboards when show_leaderboard is true', () => {
      setupActiveUser({ is_superuser: false, is_system_auditor: false });
      setupSWR({
        enabled: true,
        last_sync: null,
        show_dashboard: false,
        show_leaderboard: true,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeLeaderboard).toBe(true);
      expect(result.current.canSeeDashboard).toBe(false);
    });

    test('should return false for both when collection status defaults to null (error/loading)', () => {
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(false);
      expect(result.current.canSeeLeaderboard).toBe(false);
    });
  });

  describe('role pending (/me/ not settled yet)', () => {
    const showBoth: IAutomationDashboardCollectionStatus = {
      enabled: true,
      last_sync: null,
      show_dashboard: true,
      show_leaderboard: true,
    };

    test('should stay loading while the AWX user is pending and show_dashboard is true', () => {
      setupPendingAwxUser();
      setupSWR(showBoth);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(true);
    });

    test('should stay loading while the Platform user is pending and show_dashboard is true', () => {
      setupPendingPlatformUser();
      setupSWR(showBoth);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(true);
    });

    test('should not wait for the Platform user once the AWX user already grants access', () => {
      setupActiveUser({ is_superuser: true });
      setupPendingPlatformUser();
      setupSWR(showBoth);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.canSeeDashboard).toBe(true);
    });

    test('should not wait for the AWX user once the Platform user already grants access', () => {
      setupPendingAwxUser();
      setupPlatformUser({ is_platform_auditor: true });
      setupSWR(showBoth);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.canSeeDashboard).toBe(true);
    });

    test('should keep waiting for the Platform user when the AWX user alone does not grant access', () => {
      setupActiveUser({ is_superuser: false, is_system_auditor: false });
      setupPendingPlatformUser();
      setupSWR(showBoth);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(true);
    });

    test('should not wait for the user role when show_dashboard is false', () => {
      setupPendingAwxUser();
      setupPendingPlatformUser();
      setupSWR({ ...showBoth, show_dashboard: false });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.canSeeLeaderboard).toBe(true);
    });

    test('should not treat an unmounted provider (empty context) as pending', () => {
      vi.mocked(useAwxActiveUser).mockReturnValue({});
      vi.mocked(usePlatformActiveUser).mockReturnValue({});
      setupSWR(showBoth);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.canSeeDashboard).toBe(false);
    });

    test('should not treat a user that failed to load (null) as pending', () => {
      vi.mocked(useAwxActiveUser).mockReturnValue({
        activeAwxUser: null,
        refreshActiveAwxUser: vi.fn(),
      });
      setupSWR(showBoth);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.canSeeDashboard).toBe(false);
    });

    test('should go straight from loading to both views for a superuser once /me/ settles', () => {
      setupPendingAwxUser();
      setupSWR(showBoth);

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current.isLoading).toBe(true);

      setupActiveUser({ is_superuser: true });
      act(() => {
        rerender();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.canSeeDashboard).toBe(true);
      expect(result.current.canSeeLeaderboard).toBe(true);
    });
  });

  describe('404 handling (no metrics service)', () => {
    const notFound = () => new RequestError('Not Found', undefined, 404, undefined, undefined);

    test('should report the feature as unavailable instead of as an error', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR(undefined, notFound());

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.error).toBeUndefined();
      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.canSeeDashboard).toBe(false);
      expect(result.current.canSeeLeaderboard).toBe(false);
      expect(result.current.isUnavailable).toBe(true);
    });

    test('should poll every 5 minutes without error retries once the endpoint returns 404', () => {
      setupSWR(undefined, notFound());

      renderHook(() => useAutomationDashboardCollectionStatus());

      const lastCall = vi.mocked(useSWR).mock.calls.at(-1)!;
      expect(lastCall[0]).toContain('dashboard_reports/collection_status');
      expect(lastCall[2]).toMatchObject({
        refreshInterval: 5 * 60 * 1000,
        shouldRetryOnError: false,
      });
    });

    test('should return to normal polling once the endpoint answers again', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      };
      setupSWR(undefined, notFound());
      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());

      setupSWR(apiData);
      act(() => {
        rerender();
      });

      const lastCall = vi.mocked(useSWR).mock.calls.at(-1)!;
      expect(lastCall[2]).toMatchObject({ refreshInterval: 10 * 1000, shouldRetryOnError: true });
      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.canSeeLeaderboard).toBe(true);
      expect(result.current.isUnavailable).toBe(false);
    });

    test('should keep normal polling and surface the error for other failures', () => {
      setupSWR(undefined, new RequestError('Server Error', undefined, 500, undefined, undefined));

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.error).toBeInstanceOf(RequestError);
      expect(result.current.isUnavailable).toBe(false);
      const lastCall = vi.mocked(useSWR).mock.calls.at(-1)!;
      expect(lastCall[2]).toMatchObject({ refreshInterval: 10 * 1000, shouldRetryOnError: true });
    });

    test('should not revalidate active-user queries on a 404', () => {
      setupSWR(undefined, notFound());

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(mutate)).not.toHaveBeenCalled();
    });
  });

  describe('401 handling', () => {
    test('should revalidate both the gateway and AWX active-user queries on a 401', () => {
      setupSWR(undefined, new RequestError('Unauthorized', undefined, 401, undefined, undefined));

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(mutate)).toHaveBeenCalledWith(gatewayAPI`/me/`);
      expect(vi.mocked(mutate)).toHaveBeenCalledWith(awxAPI`/me/`);
    });

    test('should not revalidate active-user queries on a non-401 error', () => {
      setupSWR(undefined, new RequestError('Server Error', undefined, 500, undefined, undefined));

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(mutate)).not.toHaveBeenCalled();
    });

    test('should not revalidate active-user queries on a plain (non-RequestError) error', () => {
      setupSWR(undefined, new Error('Network error'));

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(mutate)).not.toHaveBeenCalled();
    });

    test('should not revalidate active-user queries when there is no error', () => {
      setupSWR({
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      });

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(mutate)).not.toHaveBeenCalled();
    });
  });

  describe('status updates', () => {
    test('should update status when data changes', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      };
      setupActiveUser({ is_superuser: true });
      setupSWR();

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(true);

      // Simulate data arriving
      setupSWR(apiData);
      act(() => {
        rerender();
      });

      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.isLoading).toBe(false);
    });

    test('should revert to default status when error occurs after data was loaded', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData);

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.isLoading).toBe(false);

      // Simulate error
      setupSWR(undefined, new Error('Server error'));
      act(() => {
        rerender();
      });

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
    });

    test('should fall back to the default status after a 404 even if data was loaded', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      };
      setupSWR(apiData);

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());

      // SWR keeps the previous data alongside the 404 error
      setupSWR(apiData, new RequestError('Not Found', undefined, 404, undefined, undefined));
      act(() => {
        rerender();
      });

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(false);
    });

    test('should transition from non-superuser to superuser and start loading', () => {
      setupActiveUser({ is_superuser: false });
      setupSWR();

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current.isLoading).toBe(false);

      // User becomes superuser
      setupActiveUser({ is_superuser: true });
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: true,
        isLoading: true,
      });

      act(() => {
        rerender();
      });

      expect(result.current.isLoading).toBe(true);
    });

    test('should track multiple loading state transitions', () => {
      setupActiveUser({ is_superuser: true });

      // Initial loading state
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: true,
        isLoading: true,
      });

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current.isLoading).toBe(true);

      // Data arrives
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        next_run: null,
        initial_collection_status: 'completed',
      };
      vi.mocked(useSWR).mockReturnValue({
        data: apiData,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      });

      act(() => {
        rerender();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.collectionStatus).toEqual(apiData);

      // Revalidating (but has cached data)
      vi.mocked(useSWR).mockReturnValue({
        data: apiData,
        error: undefined,
        mutate: vi.fn(),
        isValidating: true,
        isLoading: false,
      });

      act(() => {
        rerender();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.collectionStatus).toEqual(apiData);
    });
  });

  describe('memoization', () => {
    test('should return stable object reference when values do not change', () => {
      setupActiveUser({ is_superuser: true });
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      };
      setupSWR(apiData);

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      const firstResult = result.current;

      act(() => {
        rerender();
      });

      const secondResult = result.current;
      expect(firstResult).toBe(secondResult);
    });

    test('should return new object reference when isLoading changes', () => {
      setupActiveUser({ is_superuser: true });
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: true,
        isLoading: true,
      });

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      const firstResult = result.current;
      expect(firstResult.isLoading).toBe(true);

      // Data arrives - isLoading changes
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        last_sync: null,
        show_dashboard: true,
        show_leaderboard: true,
      };
      vi.mocked(useSWR).mockReturnValue({
        data: apiData,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      });

      act(() => {
        rerender();
      });

      const secondResult = result.current;
      expect(secondResult.isLoading).toBe(false);
      expect(firstResult).not.toBe(secondResult);
    });
  });
});
