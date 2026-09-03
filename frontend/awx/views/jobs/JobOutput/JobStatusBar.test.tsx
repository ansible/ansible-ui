import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SWRConfiguration } from 'swr';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Job } from '../../../interfaces/Job';
import { JobEvent } from '../../../interfaces/JobEvent';
import { AwxRoute } from '../../../main/AwxRoutes';
import { JobStatusBar } from './JobStatusBar';

const mockPageNavigate = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

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
    mockPageNavigate.mockClear();
    mockUseGet.mockClear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

    expect(
      screen.getByText('Running initial setup. Waiting to execute playbook')
    ).toBeInTheDocument();
  });

  it('should show the host total without status-specific host counts', () => {
    const finishedJob = {
      ...baseJob,
      status: 'successful',
      started: '2023-06-06T18:22:42Z',
      finished: '2023-06-06T18:23:02Z',
      host_status_counts: {
        ok: 999,
        dark: 1,
        failures: 2,
      },
    } as unknown as Job;

    renderJobStatusBar(finishedJob);

    expect(screen.getByText('Hosts')).toBeInTheDocument();
    expect(screen.getByText('1002')).toBeInTheDocument();
    expect(screen.queryByText('Unreachable')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed')).not.toBeInTheDocument();
  });

  it('should count undefined host status values as zero', () => {
    const finishedJob = {
      ...baseJob,
      status: 'successful',
      started: '2023-06-06T18:22:42Z',
      finished: '2023-06-06T18:23:02Z',
      playbook_counts: { play_count: 1, task_count: 9 },
      host_status_counts: {
        ok: undefined,
        failures: 2,
      },
    } as unknown as Job;

    renderJobStatusBar(finishedJob);

    expect(screen.getByText('Hosts')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should not show a host count when host status counts are unavailable', () => {
    const finishedJob = {
      ...baseJob,
      status: 'successful',
      started: '2023-06-06T18:22:42Z',
      finished: '2023-06-06T18:23:02Z',
      host_status_counts: undefined,
    } as unknown as Job;

    renderJobStatusBar(finishedJob);

    expect(screen.queryByText('Hosts')).not.toBeInTheDocument();
  });

  it('should update elapsed time every second for running jobs', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-06-06T18:22:47Z'));
    const runningJob = {
      ...baseJob,
      status: 'running',
      started: '2023-06-06T18:22:42Z',
    } as unknown as Job;

    renderJobStatusBar(runningJob);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('00:00:06')).toBeInTheDocument();
  });

  it('should clear elapsed time for running jobs without a start time', () => {
    vi.useFakeTimers();
    const runningJob = {
      ...baseJob,
      status: 'running',
      started: undefined,
    } as unknown as Job;

    renderJobStatusBar(runningJob);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('00:00:00')).not.toBeInTheDocument();
  });

  it('should navigate to the workflow visualizer from workflow jobs', async () => {
    const user = userEvent.setup();
    const workflowJob = {
      ...baseJob,
      type: 'workflow_job',
      status: 'successful',
      finished: '2023-06-06T18:23:02Z',
      unified_job_template: 42,
    } as unknown as Job;

    renderJobStatusBar(workflowJob);

    await user.click(screen.getByRole('button', { name: 'View workflow visualizer' }));

    expect(mockPageNavigate).toHaveBeenCalledWith(AwxRoute.WorkflowVisualizer, {
      params: { id: 42 },
    });
  });
});
