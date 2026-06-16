import { renderHook } from '@testing-library/react';
import { SWRConfiguration } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Job } from '../../../interfaces/Job';
import { useJobOutputChildrenSummary } from './useJobOutputChildrenSummary';

const mockUseGet = vi.fn(
  (
    _url: string | undefined,
    _query?: Record<string, string | number | boolean>,
    _swrConfiguration?: SWRConfiguration
  ) => ({
    data: undefined,
    refresh: vi.fn(),
    isLoading: false,
    error: undefined,
  })
);

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (
    url: string | undefined,
    query?: Record<string, string | number | boolean>,
    swrConfiguration?: SWRConfiguration
  ) => mockUseGet(url, query, swrConfiguration),
}));

describe('useJobOutputChildrenSummary', () => {
  beforeEach(() => {
    mockUseGet.mockClear();
  });

  it('should stop polling when job status is not running', () => {
    const finishedJob = { id: 1, type: 'job', status: 'successful' } as Job;
    renderHook(() => useJobOutputChildrenSummary(finishedJob, false));

    const swrConfig = mockUseGet.mock.calls[0][2] as unknown as SWRConfiguration;
    expect(swrConfig).toEqual({ refreshInterval: 0 });
  });

  it('should continue polling when job is running', () => {
    const runningJob = { id: 1, type: 'job', status: 'running' } as Job;
    renderHook(() => useJobOutputChildrenSummary(runningJob, false));

    const swrConfig = mockUseGet.mock.calls[0][2];
    expect(swrConfig).toBeUndefined();
  });

  it('should stop polling for failed jobs', () => {
    const failedJob = { id: 1, type: 'job', status: 'failed' } as Job;
    renderHook(() => useJobOutputChildrenSummary(failedJob, false));

    const swrConfig = mockUseGet.mock.calls[0][2] as unknown as SWRConfiguration;
    expect(swrConfig).toEqual({ refreshInterval: 0 });
  });

  it('should continue polling for pending jobs', () => {
    const pendingJob = { id: 1, type: 'job', status: 'pending' } as Job;
    renderHook(() => useJobOutputChildrenSummary(pendingJob, false));

    const swrConfig = mockUseGet.mock.calls[0][2];
    expect(swrConfig).toBeUndefined();
  });
});
