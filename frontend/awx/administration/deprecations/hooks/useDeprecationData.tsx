import useSWR from 'swr';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';

export type TimeRange = '7d' | '30d' | '6m' | '1y' | 'all';

interface JobEvent {
  id: number;
  event: string;
  stdout: string;
  start_line: number;
  task: string;
  play: string;
  playbook: string;
  created: string;
  job: number;
}

export interface DeprecationStat {
  type: string;
  description: string;
  count: number;
  severity: 'hot' | 'warm' | 'moderate' | 'cool';
  jobIds: number[];
  jobOccurrences: Record<number, number>; // job id -> occurrence count for this deprecation type
  organizations: string[]; // unique organization names from affected jobs
  jobTemplates: string[]; // unique job template names from affected jobs
}

interface DeprecationData {
  totalWarnings: number;
  affectedJobs: number;
  uniqueIssues: number;
  deprecations: DeprecationStat[];
  timeRange: TimeRange;
  /** true when one or more per-job event fetches failed (data is partial) */
  hasPartialData: boolean;
  trends?: {
    totalWarnings: number; // percentage change vs previous period, positive = increase
    affectedJobs: number;
    uniqueIssues: number;
  };
}

// Helper to extract deprecation type from event
function extractDeprecationType(event: JobEvent): string {
  const stdout = event.stdout || '';
  const task = event.task || '';

  // Check stdout first (for events that have deprecation text)
  if (stdout.includes('with_items')) return 'with_items on module';
  if (stdout.includes('with_dict')) return 'with_dict loop';
  if (stdout.includes('bare variable') || stdout.includes('Conditional result')) {
    return 'Bare variables in conditionals';
  }
  // Match the deprecated bare `include:` directive, not modern include_tasks/include_role
  if (/\binclude:\s/.test(stdout)) return 'include directive';
  if (stdout.includes('squash_actions')) return 'squash_actions';
  if (stdout.includes('hash_behaviour')) return 'hash_behaviour';

  // If stdout is empty, check task name (common for bare conditional deprecations)
  const taskLower = task.toLowerCase();
  if (taskLower.includes('bare') && taskLower.includes('conditional')) {
    return 'Bare variables in conditionals';
  }
  if (taskLower.includes('with_items')) return 'with_items on module';
  if (taskLower.includes('with_dict')) return 'with_dict loop';

  return 'Other deprecation';
}

// Helper to get description for deprecation type
export function getDeprecationDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'with_items on module': 'Using with_items on package modules (yum, dnf, apt)',
    'with_dict loop': 'Deprecated in favor of loop with dict2items filter',
    'Bare variables in conditionals': 'Variables in when statements should use {{ }} syntax',
    'include directive': 'Use import_tasks or include_tasks instead',
    squash_actions: 'Invoking modules only once while using loop',
    hash_behaviour: 'Deprecated ansible.cfg setting for hash merging',
  };
  return descriptions[type] || 'Deprecated Ansible pattern';
}

function getSeverity(count: number): 'hot' | 'warm' | 'moderate' | 'cool' {
  if (count > 50) return 'hot';
  if (count > 25) return 'warm';
  if (count > 10) return 'moderate';
  return 'cool';
}

// Helper to calculate date filter from time range
function getDateFilter(timeRange: TimeRange): string | null {
  if (timeRange === 'all') return null;

  const now = new Date();
  const date = new Date(now);

  switch (timeRange) {
    case '7d':
      date.setDate(date.getDate() - 7);
      break;
    case '30d':
      date.setDate(date.getDate() - 30);
      break;
    case '6m':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1y':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }

  return date.toISOString();
}

const CONCURRENCY_LIMIT = 10;

/** Run promises in batches to avoid flooding the API with concurrent requests. */
async function runInBatches<T>(items: T[], fn: (item: T) => Promise<void>): Promise<number> {
  let failureCount = 0;
  for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
    const batch = items.slice(i, i + CONCURRENCY_LIMIT);
    const results = await Promise.allSettled(batch.map(fn));
    failureCount += results.filter((r) => r.status === 'rejected').length;
  }
  return failureCount;
}

interface Job {
  id: number;
  summary_fields?: {
    organization?: { name: string };
    job_template?: { name: string };
  };
}

// Fetch deprecation stats for a given time window (extracted for reuse in trend calculation)
async function fetchDeprecationStats(dateFilter: string | null) {
  const jobsUrl = dateFilter
    ? awxAPI`/jobs/?page_size=50&order_by=-created&created__gte=${dateFilter}`
    : awxAPI`/jobs/?page_size=50&order_by=-created`;

  const jobsResponse = await requestGet<{ results: Job[]; count: number }>(jobsUrl);
  const jobs = jobsResponse.results;
  const deprecationsByType: Record<
    string,
    {
      count: number;
      jobIds: Set<number>;
      jobOccurrences: Record<number, number>;
      organizations: Set<string>;
      jobTemplates: Set<string>;
    }
  > = {};
  const affectedJobsSet = new Set<number>();
  let totalWarnings = 0;

  const failureCount = await runInBatches(jobs, async (job) => {
    const eventsResponse = await requestGet<{ count: number; results: JobEvent[] }>(
      awxAPI`/jobs/${job.id.toString()}/job_events/?event=deprecated`
    );
    // Use results.length (not .count) to stay consistent with what was actually processed
    if (eventsResponse.results.length > 0) {
      affectedJobsSet.add(job.id);
      totalWarnings += eventsResponse.results.length;
      eventsResponse.results.forEach((event) => {
        const type = extractDeprecationType(event);
        if (!deprecationsByType[type]) {
          deprecationsByType[type] = {
            count: 0,
            jobIds: new Set(),
            jobOccurrences: {},
            organizations: new Set(),
            jobTemplates: new Set(),
          };
        }
        deprecationsByType[type].count++;
        deprecationsByType[type].jobIds.add(job.id);
        deprecationsByType[type].jobOccurrences[job.id] =
          (deprecationsByType[type].jobOccurrences[job.id] ?? 0) + 1;

        // Capture organization and job template from job summary_fields
        if (job.summary_fields?.organization?.name) {
          deprecationsByType[type].organizations.add(job.summary_fields.organization.name);
        }
        if (job.summary_fields?.job_template?.name) {
          deprecationsByType[type].jobTemplates.add(job.summary_fields.job_template.name);
        }
      });
    }
  });

  return { totalWarnings, affectedJobsSet, deprecationsByType, failureCount };
}

// Compute % change between two values; returns 0 if previous is 0
function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Fetch and aggregate deprecation data for the given time range
async function fetchDeprecations(timeRange: TimeRange): Promise<DeprecationData> {
  const dateFilter = getDateFilter(timeRange);

  // "All time" has no meaningful previous period — skip the second fetch
  const isAllTime = timeRange === 'all';

  // Compute previous period date filter (same window shifted back in time)
  let prevDateFilter: string | null = null;
  if (!isAllTime && dateFilter) {
    const now = new Date();
    const windowMs = now.getTime() - new Date(dateFilter).getTime();
    prevDateFilter = new Date(new Date(dateFilter).getTime() - windowMs).toISOString();
  }

  // Fetch current period; fetch previous only when a meaningful comparison exists
  const [current, previous] = await Promise.all([
    fetchDeprecationStats(dateFilter),
    isAllTime ? Promise.resolve(null) : fetchDeprecationStats(prevDateFilter),
  ]);

  const deprecations: DeprecationStat[] = Object.entries(current.deprecationsByType)
    .map(([type, data]) => ({
      type,
      description: getDeprecationDescription(type),
      count: data.count,
      severity: getSeverity(data.count),
      jobIds: Array.from(data.jobIds),
      jobOccurrences: data.jobOccurrences,
      organizations: Array.from(data.organizations),
      jobTemplates: Array.from(data.jobTemplates),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalWarnings: current.totalWarnings,
    affectedJobs: current.affectedJobsSet.size,
    uniqueIssues: deprecations.length,
    deprecations,
    timeRange,
    hasPartialData: current.failureCount > 0,
    trends: previous
      ? {
          totalWarnings: percentChange(current.totalWarnings, previous.totalWarnings),
          affectedJobs: percentChange(current.affectedJobsSet.size, previous.affectedJobsSet.size),
          uniqueIssues: percentChange(
            Object.keys(current.deprecationsByType).length,
            Object.keys(previous.deprecationsByType).length
          ),
        }
      : undefined,
  };
}

export function useDeprecationData(timeRange: TimeRange = '7d'): {
  data?: DeprecationData;
  error?: Error;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
} {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DeprecationData, Error>(
    ['deprecations-dashboard', timeRange],
    () => fetchDeprecations(timeRange),
    { revalidateOnFocus: false }
  );

  return { data, error, isLoading, isRefreshing: isValidating, refresh: () => void mutate() };
}
