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
  jobIds: number[]; // IDs of jobs that have this deprecation
}

interface DeprecationData {
  totalWarnings: number;
  affectedJobs: number;
  uniqueIssues: number;
  deprecations: DeprecationStat[];
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

// Custom fetcher that fetches jobs and their deprecation events
async function fetchDeprecations() {
  // Fetch recent jobs (reduced to 20 per reviewer feedback)
  const jobsResponse = await requestGet<{ results: { id: number }[]; count: number }>(
    awxAPI`/jobs/?page_size=20&order_by=-id`
  );

  const jobs = jobsResponse.results;
  const deprecationsByType: Record<string, { count: number; jobIds: Set<number> }> = {};
  const affectedJobsSet = new Set<number>();
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

  return {
    totalWarnings,
    affectedJobs: affectedJobsSet.size,
    uniqueIssues: deprecations.length,
    deprecations,
  };
}

export function useDeprecationData(): {
  data?: DeprecationData;
  error?: Error;
  isLoading: boolean;
} {
  // Use a single SWR call with a custom fetcher that handles the N+1 query internally
  const { data, error, isLoading } = useSWR<DeprecationData, Error>(
    'deprecations-dashboard',
    fetchDeprecations,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return { data, error, isLoading };
}
