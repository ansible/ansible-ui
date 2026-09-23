/* eslint-disable i18next/no-literal-string */
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('swr');
vi.mock('../../../common/useAwxActiveUser');
vi.mock('../../../common/api/metrics-utils', () => ({
  metricsAPI: (strings: TemplateStringsArray, ...values: string[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), ''),
}));
vi.mock('../../../../common/crud/Data');

import useSWR, { mutate } from 'swr';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useFetcher } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { RequestError } from '../../../../common/crud/RequestError';
import { useAutomationDashboardCollectionStatus } from './useAutomationDashboardCollectionStatus';
import { IAutomationDashboardCollectionStatus } from '../types';
import { AwxUser } from '../../../interfaces/User';

const DEFAULT_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: null,
  min_collection_timestamp: null,
  show_dashboard: null,
  show_gamification: null,
};

function setupActiveUser({
  is_superuser = false,
  is_system_auditor = false,
}: {
  is_superuser?: boolean;
  is_system_auditor?: boolean;
} = {}) {
  vi.mocked(useAwxActiveUser).mockReturnValue({
    activeAwxUser: {
      id: 0,
      username: '',
      is_superuser,
      is_system_auditor,
      summary_fields: { user_capabilities: {} },
    } as AwxUser,
    refreshActiveAwxUser: vi.fn(),
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
    setupActiveUser();
    setupSWR();
  });

  describe('fetching', () => {
    test('should fetch regardless of the active user role', () => {
      setupActiveUser({ is_superuser: false, is_system_auditor: false });

      renderHook(() => useAutomationDashboardCollectionStatus());

      const swrKey = vi.mocked(useSWR).mock.calls[0][0];
      expect(typeof swrKey).toBe('string');
      expect(swrKey as string).toContain('dashboard_reports/collection_status');
    });

    test('should pass the fetcher function as second argument to SWR', () => {
      const mockFetcherFn = vi.fn();
      vi.mocked(useFetcher).mockReturnValue(mockFetcherFn);

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(useSWR).mock.calls[0][1]).toBe(mockFetcherFn);
    });

    test('should pass refreshInterval to SWR without overriding dedupingInterval', () => {
      renderHook(() => useAutomationDashboardCollectionStatus());

      const options = vi.mocked(useSWR).mock.calls[0][2];
      expect(options).toMatchObject({ refreshInterval: 10 * 1000 });
      expect(options).not.toHaveProperty('dedupingInterval');
    });
  });

  describe('collectionStatus', () => {
    test('should return default status when data is undefined', () => {
      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.isLoading).toBe(true);
    });

    test('should return data from API when available', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        min_collection_timestamp: '2026-09-01T14:00:00.000Z',
        show_dashboard: true,
        show_gamification: false,
      };
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
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
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
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(true);
    });

    test('should allow a system auditor to see the dashboard when show_dashboard is true', () => {
      setupActiveUser({ is_system_auditor: true });
      setupSWR({
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(true);
    });

    test('should not allow a regular user to see the dashboard even when show_dashboard is true', () => {
      setupActiveUser({ is_superuser: false, is_system_auditor: false });
      setupSWR({
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(false);
    });

    test('should not allow a superuser to see the dashboard when show_dashboard is false', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR({
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: false,
        show_gamification: false,
      });

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.canSeeDashboard).toBe(false);
    });

    test('should allow a regular user to see leaderboards when show_gamification is true', () => {
      setupActiveUser({ is_superuser: false, is_system_auditor: false });
      setupSWR({
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: false,
        show_gamification: true,
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
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
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
    });

    test('should keep normal polling and surface the error for other failures', () => {
      setupSWR(undefined, new RequestError('Server Error', undefined, 500, undefined, undefined));

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.error).toBeInstanceOf(RequestError);
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
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
      });

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(mutate)).not.toHaveBeenCalled();
    });
  });

  describe('status updates', () => {
    test('should update status when data changes', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
      };

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

    test('should keep permissions unchanged when a poll fails after data was loaded', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData);

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current.canSeeDashboard).toBe(true);

      // SWR keeps the previous data alongside the error on a failed revalidation
      setupSWR(apiData, new Error('Server error'));
      act(() => {
        rerender();
      });

      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.canSeeDashboard).toBe(true);
      expect(result.current.canSeeLeaderboard).toBe(true);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    test('should fall back to the default status after a 404 even if data was loaded', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
      };
      setupSWR(apiData);

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());

      // SWR keeps the previous data alongside the 404 error
      setupSWR(apiData, new RequestError('Not Found', undefined, 404, undefined, undefined));
      act(() => {
        rerender();
      });

      expect(result.current.collectionStatus).toEqual(DEFAULT_STATUS);
      expect(result.current.canSeeLeaderboard).toBe(false);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('memoization', () => {
    test('should return stable object reference when values do not change', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
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
        min_collection_timestamp: null,
        show_dashboard: true,
        show_gamification: true,
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
