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
        next_run: new Date('2026-05-01T00:00:00Z'),
        initial_collection_status: 'completed',
      };
      setupActiveUser({ is_superuser: true });
      setupSWR(apiData);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.isLoading).toBe(false);
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
        next_run: new Date('2026-05-01T00:00:00Z'),
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
        enabled: false,
        next_run: null,
        initial_collection_status: 'pending',
      };
      setupActiveUser({ is_superuser: false, is_platform_auditor: true });
      setupSWR(apiData);

      const { result } = renderHook(() => useAutomationDashboardCollectionStatus());

      expect(result.current.collectionStatus).toEqual(apiData);
      expect(result.current.isLoading).toBe(false);
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
        next_run: null,
        initial_collection_status: 'completed',
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
        next_run: null,
        initial_collection_status: 'completed',
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

      const secondResult = result.current;
      expect(secondResult.isLoading).toBe(false);
      expect(firstResult).not.toBe(secondResult);
    });
  });
});
