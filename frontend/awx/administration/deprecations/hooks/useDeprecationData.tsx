import { useEffect, useState } from 'react';
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
}

interface DeprecationStat {
  type: string;
  description: string;
  count: number;
  severity: 'hot' | 'warm' | 'moderate' | 'cool';
  trend: number; // Positive for increase, negative for decrease
}

interface DeprecationData {
  totalWarnings: number;
  affectedJobs: number;
  uniqueIssues: number;
  deprecations: DeprecationStat[];
  loading: boolean;
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
function getDeprecationDescription(type: string): string {
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

export function useDeprecationData(): DeprecationData {
  const [data, setData] = useState<DeprecationData>({
    totalWarnings: 0,
    affectedJobs: 0,
    uniqueIssues: 0,
    deprecations: [],
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchDeprecations() {
      try {
        // Fetch recent jobs (last 100)
        const jobsResponse = await requestGet<{ results: { id: number }[]; count: number }>(
          awxAPI`/jobs/?page_size=100&order_by=-id`
        );

        const jobs = jobsResponse.results;
        const deprecationsByType: Record<string, number> = {};
        let totalWarnings = 0;
        let affectedJobsCount = 0;

        // Fetch deprecation events for each job
        await Promise.all(
          jobs.slice(0, 20).map(async (job) => {
            // Limit to first 20 jobs for performance
            try {
              const eventsResponse = await requestGet<{ count: number; results: JobEvent[] }>(
                awxAPI`/jobs/${job.id.toString()}/job_events/?event=deprecated`
              );

              if (eventsResponse.count > 0) {
                affectedJobsCount++;
                totalWarnings += eventsResponse.count;

                // Categorize deprecations by type
                eventsResponse.results.forEach((event) => {
                  const type = extractDeprecationType(event);
                  deprecationsByType[type] = (deprecationsByType[type] || 0) + 1;
                });
              }
            } catch {
              // Skip jobs that error (403, 404, etc.)
              // Silently continue - user may not have access to all jobs
            }
          })
        );

        // Convert to array and sort by count
        const deprecations: DeprecationStat[] = Object.entries(deprecationsByType)
          .map(([type, count]) => ({
            type,
            description: getDeprecationDescription(type),
            count,
            severity: getSeverity(count),
            trend: 0, // TODO: Calculate trend from historical data
          }))
          .sort((a, b) => b.count - a.count);

        if (isMounted) {
          setData({
            totalWarnings,
            affectedJobs: affectedJobsCount,
            uniqueIssues: deprecations.length,
            deprecations,
            loading: false,
          });
        }
      } catch {
        // Failed to fetch - show empty state
        if (isMounted) {
          setData((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    void fetchDeprecations();

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
