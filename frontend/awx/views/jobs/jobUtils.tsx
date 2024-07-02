import { awxAPI } from '../../common/api/awx-utils';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { AwxRoute } from '../../main/AwxRoutes';
import { useGetPageUrl } from '../../../../framework';
import { useMemo } from 'react';

/** Returns the jobs API endpoint based on the job type */
export function getJobsAPIUrl(type: string) {
  switch (type) {
    case 'ad_hoc_command':
      return awxAPI`/ad_hoc_commands/`;
    case 'inventory_update':
      return awxAPI`/inventory_updates/`;
    case 'project_update':
      return awxAPI`/project_updates/`;
    case 'system_job':
      return awxAPI`/system_jobs/`;
    case 'workflow_job':
      return awxAPI`/workflow_jobs/`;
    default:
      return awxAPI`/jobs/`;
  }
}

type JobStatus =
  | 'failed'
  | 'new'
  | 'pending'
  | 'waiting'
  | 'running'
  | 'successful'
  | 'error'
  | 'canceled'
  | undefined;

export function isJobRunning(status: JobStatus) {
  return ['new', 'pending', 'waiting', 'running'].includes(status ?? 'waiting');
}

/** Returns the jobs relaunch endpoint based on the job type */
export function relaunchEndpoint(job: UnifiedJob) {
  switch (job.type) {
    case 'ad_hoc_command':
      return awxAPI`/ad_hoc_commands/${job.id.toString()}/relaunch/`;
    case 'workflow_job':
      return awxAPI`/workflow_jobs/${job.id.toString()}/relaunch/`;
    case 'job':
      return awxAPI`/jobs/${job.id.toString()}/relaunch/`;
    case 'inventory_update':
      return job.inventory_source ? awxAPI`/inventory_sources/${job.inventory_source}/update/` : '';
    case 'project_update':
      return job.project ? awxAPI`/projects/${job.project}/update/` : '';
    default:
      return '';
  }
}

/**
 * Returns the schedule URL for a scheduled job
 */
export function useGetScheduleUrl() {
  const getPageUrl = useGetPageUrl();
  const getScheduleUrl = useMemo<(job: UnifiedJob) => string>(() => {
    return (job: UnifiedJob) => {
      const templateId = job.summary_fields?.unified_job_template?.id;
      const scheduleId = job.summary_fields?.schedule?.id;
      const inventoryId = job.summary_fields?.inventory ? job.summary_fields.inventory.id : null;
      let scheduleUrl = '';
      if (templateId && scheduleId) {
        switch (job.type) {
          case 'inventory_update':
            scheduleUrl = inventoryId
              ? getPageUrl(AwxRoute.InventorySourceScheduleDetails, {
                  params: { id: inventoryId, source_id: templateId, schedule_id: scheduleId },
                })
              : '';
            break;
          case 'job':
            scheduleUrl = getPageUrl(AwxRoute.JobTemplateScheduleDetails, {
              params: { id: templateId, schedule_id: scheduleId },
            });
            break;
          case 'project_update':
            scheduleUrl = getPageUrl(AwxRoute.ProjectScheduleDetails, {
              params: { id: templateId, schedule_id: scheduleId },
            });
            break;
          case 'system_job':
            scheduleUrl = getPageUrl(AwxRoute.ManagementJobScheduleDetails, {
              params: { id: templateId, schedule_id: scheduleId },
            });
            break;
          case 'workflow_job':
            scheduleUrl = getPageUrl(AwxRoute.WorkflowJobTemplateScheduleDetails, {
              params: { id: templateId, schedule_id: scheduleId },
            });
            break;
          default:
            break;
        }
      }
      return scheduleUrl;
    };
  }, [getPageUrl]);
  return getScheduleUrl;
}

export type LaunchedBy = {
  link?: string;
  value?: string;
};

/**
 * Returns "Launched by" details (value and link) for a job
 */
export function useGetLaunchedByDetails() {
  const getPageUrl = useGetPageUrl();
  const getScheduleUrl = useGetScheduleUrl();
  const getLaunchedByDetails = useMemo<(job: UnifiedJob) => LaunchedBy>(() => {
    return (job: UnifiedJob) => {
      const createdBy = job.summary_fields?.created_by;
      const jobTemplate = job.summary_fields?.job_template;
      const workflowJT = job.summary_fields?.workflow_job_template;
      const schedule = job.summary_fields?.schedule;

      if (!createdBy && !schedule) {
        return {};
      }

      let link: string;
      let value: string;

      switch (job.launch_type) {
        case 'webhook':
          value = 'Webhook';
          link = jobTemplate
            ? getPageUrl(AwxRoute.JobTemplateDetails, { params: { id: jobTemplate.id } })
            : workflowJT
              ? getPageUrl(AwxRoute.WorkflowJobTemplateDetails, { params: { id: workflowJT.id } })
              : '';
          break;
        case 'scheduled':
          value = schedule?.name || '';
          link = getScheduleUrl(job);
          break;
        case 'manual':
          link = createdBy?.id
            ? getPageUrl(AwxRoute.UserDetails, { params: { id: createdBy.id } })
            : '';
          value = createdBy ? createdBy.username : '';
          break;
        default:
          link = createdBy?.id
            ? getPageUrl(AwxRoute.UserDetails, { params: { id: createdBy.id } })
            : '';
          value = createdBy ? createdBy.username : '';
          break;
      }

      return { link, value };
    };
  }, [getPageUrl, getScheduleUrl]);
  return getLaunchedByDetails;
}
