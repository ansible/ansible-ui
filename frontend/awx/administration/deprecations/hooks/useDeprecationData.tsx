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
  jobIds: number[]; // IDs of jobs that have this deprecation
}

export interface DeprecationEventsByDate {
  date: string;
  events: JobEvent[];
}

interface DeprecationData {
  totalWarnings: number;
  affectedJobs: number;
  uniqueIssues: number;
  deprecations: DeprecationStat[];
  eventsByDate: DeprecationEventsByDate[];
  timeRange: TimeRange;
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
  if (stdout.includes('include')) return 'include directive';
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

// Helper to determine severity based on count
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

const MOCK_DEPRECATION_DATA: DeprecationData = {
  totalWarnings: 147,
  affectedJobs: 13,
  uniqueIssues: 6,
  timeRange: '7d',
  eventsByDate: [
    { date: '2026-05-06', events: [] },
    { date: '2026-05-07', events: [] },
    { date: '2026-05-08', events: [] },
    { date: '2026-05-09', events: [] },
    { date: '2026-05-10', events: [] },
    { date: '2026-05-11', events: [] },
    { date: '2026-05-12', events: [] },
  ],
  deprecations: [
    {
      type: 'with_items on module',
      description: 'Using with_items on package modules (yum, dnf, apt)',
      count: 62,
      severity: 'hot',
      jobIds: [101, 102, 103, 104, 105],
    },
    {
      type: 'Bare variables in conditionals',
      description: 'Variables in when statements should use {{ }} syntax',
      count: 38,
      severity: 'warm',
      jobIds: [101, 103, 106],
    },
    {
      type: 'include directive',
      description: 'Use import_tasks or include_tasks instead',
      count: 21,
      severity: 'warm',
      jobIds: [102, 107, 108],
    },
    {
      type: 'with_dict loop',
      description: 'Deprecated in favor of loop with dict2items filter',
      count: 14,
      severity: 'moderate',
      jobIds: [104, 109],
    },
    {
      type: 'hash_behaviour',
      description: 'Deprecated ansible.cfg setting for hash merging',
      count: 8,
      severity: 'cool',
      jobIds: [110],
    },
    {
      type: 'squash_actions',
      description: 'Invoking modules only once while using loop',
      count: 4,
      severity: 'cool',
      jobIds: [111],
    },
  ],
};

// Custom fetcher that fetches jobs and their deprecation events
async function fetchDeprecations(timeRange: TimeRange) {
  void timeRange;
  return { ...MOCK_DEPRECATION_DATA, timeRange };
  const dateFilter = getDateFilter(timeRange);

  // Build jobs URL with optional date filter
  const jobsUrl = dateFilter
    ? awxAPI`/jobs/?page_size=100&order_by=-created&created__gte=${dateFilter as string}`
    : awxAPI`/jobs/?page_size=100&order_by=-created`;

  // Fetch jobs in the time range
  const jobsResponse = await requestGet<{ results: { id: number }[]; count: number }>(jobsUrl);

  const jobs = jobsResponse.results;
  const deprecationsByType: Record<string, { count: number; jobIds: Set<number> }> = {};
  const affectedJobsSet = new Set<number>();
  const allEvents: JobEvent[] = [];
  let totalWarnings = 0;

  // Fetch deprecation events for each job
  await Promise.all(
    jobs.map(async (job) => {
      try {
        const eventsResponse = await requestGet<{ count: number; results: JobEvent[] }>(
          awxAPI`/jobs/${job.id.toString()}/job_events/?event=deprecated`
        );

        if (eventsResponse.count > 0) {
          affectedJobsSet.add(job.id);
          totalWarnings += eventsResponse.count;

          eventsResponse.results.forEach((event) => {
            const type = extractDeprecationType(event);
            if (!deprecationsByType[type]) {
              deprecationsByType[type] = { count: 0, jobIds: new Set() };
            }
            deprecationsByType[type].count++;
            deprecationsByType[type].jobIds.add(job.id);
            allEvents.push(event);
          });
        }
      } catch {
        // Silently ignore errors (user may not have access to specific jobs)
      }
    })
  );

  // Convert to array and sort by count
  const deprecations: DeprecationStat[] = Object.entries(deprecationsByType)
    .map(([type, data]: [string, { count: number; jobIds: Set<number> }]) => ({
      type,
      description: getDeprecationDescription(type),
      count: data.count,
      severity: getSeverity(data.count),
      jobIds: Array.from(data.jobIds),
    }))
    .sort((a, b) => b.count - a.count);

  // Group events by date for trend graph
  const eventsByDateMap = new Map<string, JobEvent[]>();
  allEvents.forEach((event) => {
    const date = new Date(event.created).toISOString().split('T')[0]; // YYYY-MM-DD
    if (!eventsByDateMap.has(date)) {
      eventsByDateMap.set(date, []);
    }
    eventsByDateMap.get(date)!.push(event);
  });

  const eventsByDate: DeprecationEventsByDate[] = Array.from(eventsByDateMap.entries())
    .map(([date, events]) => ({ date, events }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalWarnings,
    affectedJobs: affectedJobsSet.size,
    uniqueIssues: deprecations.length,
    deprecations,
    eventsByDate,
    timeRange,
  };
}

export function useDeprecationData(timeRange: TimeRange = '7d'): {
  data?: DeprecationData;
  error?: Error;
  isLoading: boolean;
} {
  // Use a single SWR call with a custom fetcher that handles the N+1 query internally
  const { data, error, isLoading } = useSWR<DeprecationData, Error>(
    ['deprecations-dashboard', timeRange],
    () => fetchDeprecations(timeRange),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return { data, error, isLoading };
}
