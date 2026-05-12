import useSWR from 'swr';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useMemo } from 'react';

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

export function useDeprecationData(): {
  data?: DeprecationData;
  error?: Error;
  isLoading: boolean;
} {
  // Fetch all deprecation events directly (single query instead of N+1)
  // Note: This fetches ALL deprecation events visible to the user (RBAC-filtered by AWX)
  const {
    data: eventsData,
    error,
    isLoading,
  } = useSWR<{ count: number; results: JobEvent[] }, Error>(
    awxAPI`/job_events/?event=deprecated&page_size=200&order_by=-id`,
    requestGet
  );

  const data = useMemo(() => {
    if (!eventsData) return undefined;

    const deprecationsByType: Record<string, number> = {};
    const affectedJobsSet = new Set<number>();
    let totalWarnings = 0;

    eventsData.results.forEach((event) => {
      totalWarnings++;
      affectedJobsSet.add(event.job);

      const type = extractDeprecationType(event);
      deprecationsByType[type] = (deprecationsByType[type] || 0) + 1;
    });

    // Convert to array and sort by count
    const deprecations: DeprecationStat[] = Object.entries(deprecationsByType)
      .map(([type, count]: [string, number]) => ({
        type,
        description: getDeprecationDescription(type),
        count,
        severity: getSeverity(count),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalWarnings,
      affectedJobs: affectedJobsSet.size,
      uniqueIssues: deprecations.length,
      deprecations,
    };
  }, [eventsData]);

  return { data, error, isLoading };
}
