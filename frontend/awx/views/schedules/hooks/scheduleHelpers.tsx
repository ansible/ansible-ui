import { RouteObj } from '../../../../Routes';
import { useParams } from 'react-router-dom';

const createRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceSchedulesCreate,
  job_templates: RouteObj.JobTemplateSchedulesCreate,
  workflow_job_template: RouteObj.WorkflowJobTemplateSchedulesCreate,
  projects: RouteObj.ProjectSchedulesCreate,
};

export function useGetSchedulCreateUrl(sublistEndPoint?: string) {
  const params = useParams<{ id: string; schedule_id?: string }>();
  if (!sublistEndPoint) return RouteObj.CreateSchedule;
  let createUrl: string = RouteObj.CreateSchedule;
  const resource_type = Object.keys(createRoutes).find((route) =>
    sublistEndPoint?.split('/').includes(route)
  );
  if (resource_type && params?.id) {
    createUrl = createRoutes[resource_type].replace(':id', params.id);
  }
  return createUrl;
}

export const resourceEndPoints: { [key: string]: string } = {
  inventory: '/api/v2/inventories/',
  projects: '/api/v2/projects/',
  job_template: '/api/v2/job_templates/',
  workflow_job_template: '/api/v2/workflow_job_templates/',
};
