/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useRepositories } from './useRepositories';

// Mock useGet hook
const mockUseGet = vi.fn();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url: string) => mockUseGet(url),
}));

// Mock isInsightsMode
vi.mock('../../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

// Import the mock so we can change its return value
import { isInsightsMode } from '../../../common/isInsights';

describe('useRepositories', () => {
  beforeEach(() => {
    mockUseGet.mockReturnValue({ data: null, isLoading: false, error: null });
    vi.mocked(isInsightsMode).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('in Platform mode (non-Insights)', () => {
    it('should call useGet with the UI API endpoint', () => {
      renderHook(() => useRepositories());

      expect(mockUseGet).toHaveBeenCalledTimes(1);
      const calledUrl = mockUseGet.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('/_ui/v1/distributions/');
    });

    it('should not use Pulp API in Platform mode', () => {
      renderHook(() => useRepositories());

      const calledUrl = mockUseGet.mock.calls[0]?.[0] as string;
      expect(calledUrl).not.toContain('/pulp/api/v3/');
    });
  });

  describe('in Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    it('should call useGet with the Pulp API endpoint', () => {
      renderHook(() => useRepositories());

      expect(mockUseGet).toHaveBeenCalledTimes(1);
      const calledUrl = mockUseGet.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('/pulp/api/v3/distributions/ansible/ansible/');
    });

    it('should not use UI API in Insights mode', () => {
      renderHook(() => useRepositories());

      const calledUrl = mockUseGet.mock.calls[0]?.[0] as string;
      expect(calledUrl).not.toContain('/_ui/v1/distributions/');
    });
  });

  it('should return the result from useGet', () => {
    const mockData = {
      data: [{ name: 'test-repo', pulp_href: '/pulp/api/v3/repos/1/' }],
    };
    mockUseGet.mockReturnValue({ data: mockData, isLoading: false, error: null });

    const { result } = renderHook(() => useRepositories());

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
