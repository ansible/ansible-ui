import { useCallback } from 'react';
import { useGetPageUrl } from '../../../../framework';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { AwxRoute } from '../../main/AwxRoutes';

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

const jobPaths: { [key: string]: string } = {
  project_update: 'project',
  inventory_update: 'inventory',
  job: 'playbook',
  ad_hoc_command: 'command',
  system_job: 'management',
  workflow_job: 'workflow',
};
