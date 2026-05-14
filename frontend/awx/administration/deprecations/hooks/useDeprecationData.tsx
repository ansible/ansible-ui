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

// Fetch deprecation stats for a given time window (extracted for reuse in trend calculation)
async function fetchDeprecationStats(dateFilter: string | null) {
  const jobsUrl = dateFilter
    ? awxAPI`/jobs/?page_size=100&order_by=-created&created__gte=${dateFilter}`
    : awxAPI`/jobs/?page_size=100&order_by=-created`;

  const jobsResponse = await requestGet<{ results: { id: number }[]; count: number }>(jobsUrl);
  const jobs = jobsResponse.results;
  const deprecationsByType: Record<
    string,
    { count: number; jobIds: Set<number>; jobOccurrences: Record<number, number> }
  > = {};
  const affectedJobsSet = new Set<number>();
  const allEvents: JobEvent[] = [];
  let totalWarnings = 0;

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
              deprecationsByType[type] = { count: 0, jobIds: new Set(), jobOccurrences: {} };
            }
            deprecationsByType[type].count++;
            deprecationsByType[type].jobIds.add(job.id);
            deprecationsByType[type].jobOccurrences[job.id] =
              (deprecationsByType[type].jobOccurrences[job.id] ?? 0) + 1;
            allEvents.push(event);
          });
        }
      } catch {
        // Silently ignore errors (user may not have access to specific jobs)
      }
    })
  );

  return { totalWarnings, affectedJobsSet, deprecationsByType, allEvents };
}

// Compute % change between two values; returns 0 if previous is 0
function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Fetch and aggregate deprecation data for the given time range
async function fetchDeprecations(timeRange: TimeRange): Promise<DeprecationData> {
  const dateFilter = getDateFilter(timeRange);

  // Compute previous period date filter (same window, shifted back)
  let prevDateFilter: string | null = null;
  if (dateFilter) {
    const now = new Date();
    const windowMs = now.getTime() - new Date(dateFilter).getTime();
    prevDateFilter = new Date(new Date(dateFilter).getTime() - windowMs).toISOString();
  }

  // Fetch current and previous periods in parallel for trend calculation
  const [current, previous] = await Promise.all([
    fetchDeprecationStats(dateFilter),
    fetchDeprecationStats(prevDateFilter),
  ]);

  const deprecations: DeprecationStat[] = Object.entries(current.deprecationsByType)
    .map(([type, data]) => ({
      type,
      description: getDeprecationDescription(type),
      count: data.count,
      severity: getSeverity(data.count),
      jobIds: Array.from(data.jobIds),
      jobOccurrences: data.jobOccurrences,
    }))
    .sort((a, b) => b.count - a.count);

  const eventsByDateMap = new Map<string, JobEvent[]>();
  current.allEvents.forEach((event) => {
    const date = new Date(event.created).toISOString().split('T')[0];
    if (!eventsByDateMap.has(date)) eventsByDateMap.set(date, []);
    eventsByDateMap.get(date)!.push(event);
  });

  const eventsByDate: DeprecationEventsByDate[] = Array.from(eventsByDateMap.entries())
    .map(([date, events]) => ({ date, events }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalWarnings: current.totalWarnings,
    affectedJobs: current.affectedJobsSet.size,
    uniqueIssues: deprecations.length,
    deprecations,
    eventsByDate,
    timeRange,
    trends: {
      totalWarnings: percentChange(current.totalWarnings, previous.totalWarnings),
      affectedJobs: percentChange(current.affectedJobsSet.size, previous.affectedJobsSet.size),
      uniqueIssues: percentChange(
        Object.keys(current.deprecationsByType).length,
        Object.keys(previous.deprecationsByType).length
      ),
    },
  };
}

export function useDeprecationData(timeRange: TimeRange = '7d'): {
  data?: DeprecationData;
  error?: Error;
  isLoading: boolean;
} {
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
