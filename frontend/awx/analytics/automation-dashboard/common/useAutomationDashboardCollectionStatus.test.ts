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
import { usePlatformActiveUser } from '../../../../../platform/main/PlatformActiveUserProvider';
import { useFetcher } from '../../../../common/crud/Data';
import { useAutomationDashboardCollectionStatus } from './useAutomationDashboardCollectionStatus';
import { IAutomationDashboardCollectionStatus } from '../types';

const DEFAULT_STATUS: IAutomationDashboardCollectionStatus = {
  enabled: null,
  next_run: null,
  initial_collection_status: null,
};

function setupActiveUser({
  is_superuser = false,
  is_platform_auditor = false,
}: {
  is_superuser?: boolean;
  is_platform_auditor?: boolean;
} = {}) {
  vi.mocked(usePlatformActiveUser).mockReturnValue({
    activePlatformUser: { is_superuser, is_platform_auditor } as never,
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
    activePlatformUser: null as never,
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
  } as never);
}

describe('useAutomationDashboardCollectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFetcher).mockReturnValue(vi.fn() as never);
  });

  describe('when user is not superuser or auditor', () => {
    test('should return default status and not fetch', () => {
      setupActiveUser({ is_superuser: false, is_platform_auditor: false });
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(DEFAULT_STATUS);
      // SWR should be called with null key (no fetch)
      expect(vi.mocked(useSWR).mock.calls[0][0]).toBeNull();
    });
  });

  describe('when activePlatformUser is undefined (still loading)', () => {
    test('should return default status and not fetch', () => {
      setupActiveUserUndefined();
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(DEFAULT_STATUS);
      expect(vi.mocked(useSWR).mock.calls[0][0]).toBeNull();
    });
  });

  describe('when activePlatformUser is null (not logged in)', () => {
    test('should return default status and not fetch', () => {
      setupActiveUserNull();
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(DEFAULT_STATUS);
      expect(vi.mocked(useSWR).mock.calls[0][0]).toBeNull();
    });
  });

  describe('when user is superuser', () => {
    test('should return default status when data is undefined', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR();

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(DEFAULT_STATUS);
    });

    test('should return data from API when available', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        next_run: new Date('2026-05-01T00:00:00Z'),
        initial_collection_status: 'completed',
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(apiData);
    });

    test('should return default status on error', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR(undefined, new Error('Network error'));

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(DEFAULT_STATUS);
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
      vi.mocked(useFetcher).mockReturnValue(mockFetcherFn as never);
      setupActiveUser({ is_superuser: true });
      setupSWR();

      renderHook(() => useAutomationDashboardCollectionStatus());

      expect(vi.mocked(useSWR).mock.calls[0][1]).toBe(mockFetcherFn);
    });

    test('should pass dedupingInterval and refreshInterval options to SWR', () => {
      setupActiveUser({ is_superuser: true });
      setupSWR();

      renderHook(() => useAutomationDashboardCollectionStatus());

      const options = vi.mocked(useSWR).mock.calls[0][2] as Record<string, unknown>;
      expect(options).toMatchObject({ dedupingInterval: 0, refreshInterval: 10 * 1000 });
    });

    test('should return default status during initial loading (no data and no error)', () => {
      setupActiveUser({ is_superuser: true });
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: true,
        isLoading: true,
      } as never);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(DEFAULT_STATUS);
    });
  });

  describe('when user is platform auditor', () => {
    test('should fetch and return data', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: false,
        next_run: null,
        initial_collection_status: 'pending',
      };
      setupActiveUser({ is_superuser: false, is_platform_auditor: true });
      setupSWR(apiData);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current).toEqual(apiData);
      const swrKey = vi.mocked(useSWR).mock.calls[0][0];
      expect(swrKey).not.toBeNull();
    });
  });

  describe('status updates', () => {
    test('should update status when data changes', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        next_run: null,
        initial_collection_status: 'running',
      };
      setupActiveUser({ is_superuser: true });
      setupSWR();

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current).toEqual(DEFAULT_STATUS);

      // Simulate data arriving
      setupSWR(apiData);
      act(() => {
        rerender();
      });

      expect(result.current).toEqual(apiData);
    });

    test('should revert to default status when error occurs after data was loaded', () => {
      const apiData: IAutomationDashboardCollectionStatus = {
        enabled: true,
        next_run: null,
        initial_collection_status: 'completed',
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData);

      const { result, rerender } = renderHook(() => useAutomationDashboardCollectionStatus());
      expect(result.current).toEqual(apiData);

      // Simulate error
      setupSWR(undefined, new Error('Server error'));
      act(() => {
        rerender();
      });

      expect(result.current).toEqual(DEFAULT_STATUS);
    });
  });
});
