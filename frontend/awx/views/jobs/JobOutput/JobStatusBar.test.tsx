import { render, screen } from '@testing-library/react';
import { SWRConfiguration } from 'swr';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Job } from '../../../interfaces/Job';
import { JobEvent } from '../../../interfaces/JobEvent';
import { JobStatusBar } from './JobStatusBar';

const mockUseGet = vi.fn(
  (
    _url: string | undefined,
    _query?: Record<string, string | number | boolean>,
    _swrConfiguration?: SWRConfiguration
  ) => ({
    data: {
      count: 0,
      results: [],
      next: null,
      previous: null,
    } as AwxItemsResponse<JobEvent>,
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

function renderJobStatusBar(job: Job) {
  return render(
    <MemoryRouter>
      <JobStatusBar job={job} />
    </MemoryRouter>
  );
}

const baseJob = {
  id: 1,
  type: 'job',
  name: 'Test Job',
  elapsed: '10',
  host_status_counts: {},
  playbook_counts: { play_count: 1, task_count: 2 },
} as unknown as Job;

describe('JobStatusBar polling', () => {
  beforeEach(() => {
    mockUseGet.mockClear();
  });

  it('should pass undefined URL when job is finished', () => {
    const finishedJob = {
      ...baseJob,
      status: 'successful',
      started: '2023-06-06T18:22:42Z',
      finished: '2023-06-06T18:23:02Z',
    } as unknown as Job;

    renderJobStatusBar(finishedJob);

    expect(mockUseGet.mock.calls[0][0]).toBeUndefined();
  });

  it('should poll at 5000ms when playbook job is running and playbook has not started', () => {
    const runningJob = {
      ...baseJob,
      status: 'running',
      started: '2023-06-06T18:22:42Z',
    } as unknown as Job;

    renderJobStatusBar(runningJob);

    expect(mockUseGet.mock.calls[0][0]).toContain('/jobs/1/job_events/');

    const swrConfig = mockUseGet.mock.calls[0][2] as unknown as {
      refreshInterval: (data: AwxItemsResponse<JobEvent>) => number;
    };

    expect(swrConfig.refreshInterval({ count: 0, results: [] } as AwxItemsResponse<JobEvent>)).toBe(
      5000
    );
  });

  it('should stop polling when playbook_on_start event is received and job is running', () => {
    const runningJob = {
      ...baseJob,
      status: 'running',
      started: '2023-06-06T18:22:42Z',
    } as unknown as Job;

    renderJobStatusBar(runningJob);

    const swrConfig = mockUseGet.mock.calls[0][2] as unknown as {
      refreshInterval: (data: AwxItemsResponse<JobEvent>) => number;
    };

    const eventData = {
      count: 1,
      results: [{ event: 'playbook_on_start' }],
    } as AwxItemsResponse<JobEvent>;

    expect(swrConfig.refreshInterval(eventData)).toBe(0);
  });

  it('should pass undefined URL for non-playbook job types', () => {
    const projectUpdateJob = {
      ...baseJob,
      type: 'project_update',
      status: 'running',
      started: '2023-06-06T18:22:42Z',
    } as unknown as Job;

    renderJobStatusBar(projectUpdateJob);

    expect(mockUseGet.mock.calls[0][0]).toBeUndefined();
  });

  it('should not show waiting label for non-playbook job types', () => {
    const inventoryUpdateJob = {
      ...baseJob,
      type: 'inventory_update',
      status: 'running',
      started: '2023-06-06T18:22:42Z',
    } as unknown as Job;

    renderJobStatusBar(inventoryUpdateJob);

    expect(screen.queryByTestId('waiting-label')).not.toBeInTheDocument();
  });

  it('should show waiting label for running playbook jobs before playbook starts', () => {
    const runningJob = {
      ...baseJob,
      status: 'running',
      started: '2023-06-06T18:22:42Z',
    } as unknown as Job;

    renderJobStatusBar(runningJob);

    expect(screen.getByTestId('waiting-label')).toBeInTheDocument();
  });
});
