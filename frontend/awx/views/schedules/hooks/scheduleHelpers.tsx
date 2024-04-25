import { useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';

export const resourceEndPoints: { [key: string]: string } = {
  sources: awxAPI`/inventory_sources/`,
  projects: awxAPI`/projects/`,
  job_template: awxAPI`/job_templates/`,
  workflow_job_template: awxAPI`/workflow_job_templates/`,
  'management-jobs': awxAPI`/system_job_templates/`,
};
export const scheduleResourceTypeOptions: string[] = [
  'job_template',
  'workflow_job_template',
  'inventory',
  'projects',
  'management-jobs',
];

export function useGetSchedulCreateUrl(sublistEndPoint?: string) {
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    inventory_type?: string;
    id: string;
    source_id: string;
  }>();
  const createScheduleContainerRoutes: { [key: string]: string } = {
    inventory_sources: getPageUrl(AwxRoute.InventorySourceScheduleCreate, {
      params: { inventory_type: params.inventory_type, id: params.id, source_id: params.source_id },
    }),
    job_templates: getPageUrl(AwxRoute.JobTemplateScheduleCreate, {
      params: { id: params.id },
    }),
    workflow_job_templates: getPageUrl(AwxRoute.WorkflowJobTemplateScheduleCreate, {
      params: { id: params.id },
    }),
    projects: getPageUrl(AwxRoute.ProjectScheduleCreate, {
      params: { id: params.id },
    }),
    management_job: getPageUrl(AwxRoute.ManagementJobScheduleCreate, {
      params: { id: params.id },
    }),
    system_job_templates: getPageUrl(AwxRoute.ManagementJobScheduleCreate, {
      params: { id: params.id },
    }),
  };

  if (!sublistEndPoint) return getPageUrl(AwxRoute.CreateSchedule);
  let createUrl: string = getPageUrl(AwxRoute.CreateSchedule);
  const resource_type = Object.keys(createScheduleContainerRoutes).find((route) =>
    sublistEndPoint?.split('/').includes(route)
  );
  if (resource_type) {
    createUrl = createScheduleContainerRoutes[resource_type];
  }
  return createUrl;
}
