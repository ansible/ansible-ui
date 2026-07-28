import useSWR from 'swr';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';

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
  /** true when one or more per-job event fetches failed (data is partial) */
  hasPartialData: boolean;
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

async function fetchDeprecationStats() {
  const jobsUrl = awxAPI`/jobs/?page_size=50&order_by=-created`;

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
      awxAPI`/jobs/${job.id.toString()}/job_events/?event=deprecated&page_size=200`
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

// Fetch and aggregate deprecation data from the last 50 jobs
async function fetchDeprecations(): Promise<DeprecationData> {
  const current = await fetchDeprecationStats();

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
    hasPartialData: current.failureCount > 0,
  };
}

export function useDeprecationData(): {
  data?: DeprecationData;
  error?: Error;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
} {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DeprecationData, Error>(
    'deprecations-dashboard',
    () => fetchDeprecations(),
    { revalidateOnFocus: false }
  );

  return { data, error, isLoading, isRefreshing: isValidating, refresh: () => void mutate() };
}
