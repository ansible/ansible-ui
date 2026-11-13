import type { IDashboardDetails } from '../types';

export interface DashboardMockJob {
  id: number;
  status: 'successful' | 'failed';
  finished: string;
  organizationId: number;
  labelsAtRun: number[];
}

/**
 * Represents a label added to a template after an earlier run completed.
 * The earlier run intentionally has no label in `labelsAtRun` so it must not
 * be included in a label-filtered aggregation.
 */
export const dashboardLabelAggregationJobs: DashboardMockJob[] = [
  {
    id: 1001,
    status: 'successful',
    finished: '2026-11-04T12:00:00.000Z',
    organizationId: 1,
    labelsAtRun: [],
  },
  {
    id: 1002,
    status: 'successful',
    finished: '2026-11-08T12:00:00.000Z',
    organizationId: 1,
    labelsAtRun: [42],
  },
  {
    id: 1003,
    status: 'failed',
    finished: '2026-11-09T12:00:00.000Z',
    organizationId: 2,
    labelsAtRun: [42],
  },
  {
    id: 1004,
    status: 'successful',
    finished: '2026-11-13T12:00:00.000Z',
    organizationId: 2,
    labelsAtRun: [42],
  },
];

export function getLabelFilteredJobs(
  jobs: DashboardMockJob[],
  options: Readonly<{
    labelId: number;
    start: string;
    end: string;
    organizationIds?: number[];
  }>
) {
  return jobs.filter(
    (job) =>
      job.finished >= options.start &&
      job.finished <= options.end &&
      job.labelsAtRun.includes(options.labelId) &&
      (options.organizationIds === undefined ||
        options.organizationIds.includes(job.organizationId))
  );
}

export function dashboardDetailsFromJobs(jobs: DashboardMockJob[]): IDashboardDetails {
  return {
    total_number_of_successful_jobs: jobs.filter((job) => job.status === 'successful').length,
    total_number_of_failed_jobs: jobs.filter((job) => job.status === 'failed').length,
    total_number_of_unique_hosts: 0,
    cost_of_automated_execution: 0,
    cost_of_manual_automation: 0,
    total_hours_of_automation: 0,
    total_saving: 0,
    total_time_saving: 0,
    total_number_of_host_job_runs: jobs.length,
    total_number_of_job_runs: jobs.length,
    top_projects: [],
    top_users: [],
    job_chart: { kind: 'day', items: [] },
    host_chart: { kind: 'day', items: [] },
  };
}
