/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteJobs } from './useDeleteJobs';
import { useCancelJobs } from './useCancelJobs';
import { useDeleteHostMetrics } from './useDeleteHostMetrics';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { HostMetric } from '../../../interfaces/HostMetric';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));
vi.mock('./useJobsColumns', () => ({
  useJobsColumns: vi.fn(() => []),
}));
vi.mock('./useHostMetricsColumns', () => ({
  useHostMetricsColumns: vi.fn(() => []),
}));
vi.mock('./useHostMetricNameColumn', () => ({
  useHostMetricNameColumn: vi.fn(() => ({ header: 'Hostname' })),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

function createMockJob(overrides: Partial<UnifiedJob> = {}): UnifiedJob {
  return {
    id: 1,
    name: 'Job A',
    type: 'job',
    status: 'successful',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, start: true, cancel: true },
    },
    ...overrides,
  } as UnifiedJob;
}

function createMockHostMetric(overrides: Partial<HostMetric> = {}): HostMetric {
  return {
    id: 1,
    hostname: 'host-a.example.com',
    ...overrides,
  } as HostMetric;
}

describe('useDeleteJobs', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const jobs = [createMockJob(), createMockJob({ id: 2, name: 'Job B' })];
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete jobs/i);
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current([createMockJob()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current([createMockJob()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should include alertPrompts for running jobs', () => {
    const jobs = [
      createMockJob({ id: 1, name: 'Running', status: 'running' }),
      createMockJob({ id: 2, name: 'Successful', status: 'successful' }),
    ];
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
    expect(callArgs.alertPrompts.length).toBeGreaterThan(0);
  });

  test('should include alertPrompts for jobs without delete permission', () => {
    const jobs = [
      createMockJob({
        id: 1,
        name: 'No Permission',
        status: 'successful',
        summary_fields: {
          user_capabilities: { edit: true, delete: false, start: true, cancel: true },
        },
      } as Partial<UnifiedJob>),
    ];
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
  });

  test('should not include alertPrompts when all jobs are deletable', () => {
    const jobs = [
      createMockJob({ id: 1, name: 'Done 1', status: 'successful' }),
      createMockJob({ id: 2, name: 'Done 2', status: 'failed' }),
    ];
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });

  test('should provide isItemNonActionable that returns reason for running job', () => {
    const jobs = [createMockJob({ status: 'running' })];
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const reason = callArgs.isItemNonActionable(createMockJob({ status: 'running' }));
    expect(reason).toMatch(/cannot be deleted/i);
  });

  test('should provide isItemNonActionable that returns empty for successful job with permission', () => {
    const jobs = [createMockJob()];
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const reason = callArgs.isItemNonActionable(createMockJob({ status: 'successful' }));
    expect(reason).toBe('');
  });

  test('should provide actionFn that calls requestDelete for standard jobs', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current([createMockJob({ id: 42, type: 'job' })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockJob({ id: 42, type: 'job' }), signal);

    expect(requestDelete).toHaveBeenCalledWith(expect.stringContaining('/jobs/'), signal);
  });

  test('should provide actionFn that uses workflow_jobs URL for workflow_job type', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current([createMockJob({ id: 10, type: 'workflow_job' })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockJob({ id: 10, type: 'workflow_job' }), signal);

    expect(requestDelete).toHaveBeenCalledWith(expect.stringContaining('/workflow_jobs/'), signal);
  });

  test('should provide actionFn that uses project_updates URL for project_update type', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current([createMockJob({ id: 15, type: 'project_update' })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockJob({ id: 15, type: 'project_update' }), signal);

    expect(requestDelete).toHaveBeenCalledWith(
      expect.stringContaining('/project_updates/'),
      signal
    );
  });

  test('should sort jobs by name', () => {
    const jobs = [createMockJob({ id: 1, name: 'Zulu' }), createMockJob({ id: 2, name: 'Alpha' })];
    const { result } = renderHook(() => useDeleteJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha');
    expect(callArgs.items[1].name).toBe('Zulu');
  });
});

describe('useCancelJobs', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a cancel function', () => {
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const jobs = [createMockJob({ status: 'running' })];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/cancel jobs/i);
  });

  test('should include alertPrompts for non-running jobs', () => {
    const jobs = [
      createMockJob({ id: 1, name: 'Running', status: 'running' }),
      createMockJob({ id: 2, name: 'Done', status: 'successful' }),
    ];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
    expect(callArgs.alertPrompts.length).toBeGreaterThan(0);
  });

  test('should include alertPrompts for running jobs without start permission', () => {
    const jobs = [
      createMockJob({
        id: 1,
        status: 'running',
        summary_fields: {
          user_capabilities: { edit: true, delete: true, start: false, cancel: true },
        },
      } as Partial<UnifiedJob>),
    ];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
  });

  test('should not include alertPrompts when all jobs are cancellable', () => {
    const jobs = [
      createMockJob({ id: 1, status: 'running' }),
      createMockJob({ id: 2, status: 'pending' }),
    ];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });

  test('should provide isItemNonActionable that returns reason for non-running job', () => {
    const jobs = [createMockJob({ status: 'successful' })];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const reason = callArgs.isItemNonActionable(createMockJob({ status: 'successful' }));
    expect(reason).toMatch(/cannot be canceled/i);
  });

  test('should provide isItemNonActionable that returns empty for running cancellable job', () => {
    const jobs = [createMockJob({ status: 'running' })];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const reason = callArgs.isItemNonActionable(createMockJob({ status: 'running' }));
    expect(reason).toBe('');
  });

  test('should provide actionFn that posts cancel to job endpoint', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current([createMockJob({ id: 42, type: 'job', status: 'running' })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    await callArgs.actionFn(createMockJob({ id: 42, type: 'job' }));

    expect(mockPostRequest).toHaveBeenCalledWith(expect.stringContaining('/jobs/42/cancel/'), {});
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current([createMockJob({ status: 'running' })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should handle pending status as running', () => {
    const jobs = [createMockJob({ status: 'pending' })];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });

  test('should handle waiting status as running', () => {
    const jobs = [createMockJob({ status: 'waiting' })];
    const { result } = renderHook(() => useCancelJobs(mockOnComplete));

    result.current(jobs);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });
});

describe('useDeleteHostMetrics', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteHostMetrics(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const metrics = [createMockHostMetric(), createMockHostMetric({ id: 2, hostname: 'host-b' })];
    const { result } = renderHook(() => useDeleteHostMetrics(mockOnComplete));

    result.current(metrics);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/soft delete hostnames/i);
  });

  test('should call bulkAction with correct confirm text', () => {
    const metrics = [createMockHostMetric(), createMockHostMetric({ id: 2, hostname: 'host-b' })];
    const { result } = renderHook(() => useDeleteHostMetrics(mockOnComplete));

    result.current(metrics);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmText).toContain('2');
  });

  test('should sort by hostname', () => {
    const metrics = [
      createMockHostMetric({ id: 1, hostname: 'zulu.example.com' }),
      createMockHostMetric({ id: 2, hostname: 'alpha.example.com' }),
    ];
    const { result } = renderHook(() => useDeleteHostMetrics(mockOnComplete));

    result.current(metrics);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].hostname).toBe('alpha.example.com');
    expect(callArgs.items[1].hostname).toBe('zulu.example.com');
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteHostMetrics(mockOnComplete));

    result.current([createMockHostMetric()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteHostMetrics(mockOnComplete));

    result.current([createMockHostMetric()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should provide actionFn that calls requestDelete with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteHostMetrics(mockOnComplete));

    result.current([createMockHostMetric({ id: 88 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockHostMetric({ id: 88 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(
      expect.stringContaining('/host_metrics/88/'),
      signal
    );
  });
});
