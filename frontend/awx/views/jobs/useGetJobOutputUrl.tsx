import { useCallback } from 'react';
import { useGetPageUrl } from '../../../../framework';
import { AwxRoute } from '../../AwxRoutes';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { jobPaths } from './useGetJobOutputUrl';

export function useGetJobOutputUrl() {
  const getPageUrl = useGetPageUrl();
  const getJobOutputUrl = useCallback(
    (job: UnifiedJob) => {
      return getPageUrl(AwxRoute.JobOutput, {
        params: {
          job_type: jobPaths[job.type],
          id: job.id,
        },
      });
    },
    [getPageUrl]
  );
  return getJobOutputUrl;
}
export const jobPaths: { [key: string]: string } = {
  project_update: 'project',
  inventory_update: 'inventory',
  job: 'playbook',
  ad_hoc_command: 'command',
  system_job: 'management',
  workflow_job: 'workflow',
};
