import { renderHook } from '@testing-library/react';
import { SWRConfiguration } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Job } from '../../interfaces/Job';
import { useGetJob } from './JobPage';

vi.mock('./JobHeader', () => ({
  JobHeader: () => null,
}));

const mockUseGet = vi.fn(
  (
    _url: string | undefined,
    _query?: Record<string, string | number | boolean>,
    _swrConfiguration?: SWRConfiguration
  ) => ({
    data: undefined as Job | undefined,
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

describe('useGetJob', () => {
  beforeEach(() => {
    mockUseGet.mockClear();
  });

  it('should build the correct API URL for each job type', () => {
    renderHook(() => useGetJob('1', 'playbook'));
    expect(mockUseGet.mock.calls[0][0]).toContain('/jobs/1/');

    mockUseGet.mockClear();
    renderHook(() => useGetJob('2', 'workflow'));
    expect(mockUseGet.mock.calls[0][0]).toContain('/workflow_jobs/2/');

    mockUseGet.mockClear();
    renderHook(() => useGetJob('3', 'project'));
    expect(mockUseGet.mock.calls[0][0]).toContain('/project_updates/3/');
  });

  it('should stop polling when job data has finished set', () => {
    renderHook(() => useGetJob('1', 'playbook'));

    const swrConfig = mockUseGet.mock.calls[0][2] as unknown as {
      refreshInterval: (data: Job | undefined) => number;
    };

    const finishedJob = { finished: '2023-06-06T18:23:02.484722Z' } as Job;
    expect(swrConfig.refreshInterval(finishedJob)).toBe(0);
  });

  it('should continue polling at the configured interval when job is not finished', () => {
    renderHook(() => useGetJob('1', 'playbook'));

    const swrConfig = mockUseGet.mock.calls[0][2] as unknown as {
      refreshInterval: (data: Job | undefined) => number;
    };

    const runningJob = { status: 'running' } as Job;
    expect(swrConfig.refreshInterval(runningJob)).toBe(60000);
  });

  it('should continue polling when no data is available yet', () => {
    renderHook(() => useGetJob('1', 'playbook'));

    const swrConfig = mockUseGet.mock.calls[0][2] as unknown as {
      refreshInterval: (data: Job | undefined) => number;
    };

    expect(swrConfig.refreshInterval(undefined)).toBe(60000);
  });
});
