import { RouteObj } from '../../../../Routes';
import { useLocation, useParams } from 'react-router-dom';

const createRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceSchedulesCreate,
  job_templates: RouteObj.JobTemplateSchedulesCreate,
  workflow_job_template: RouteObj.WorkflowJobTemplateSchedulesCreate,
  projects: RouteObj.ProjectSchedulesCreate,
};

export const scheduleResourceTypeOptions: string[] = [
  'job_template',
  'workflow_job_template',
  'inventory',
  'projects',
];

export const scheduleDetailRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceScheduleDetails,
  job_template: RouteObj.JobTemplateScheduleDetails,
  workflow_job_template: RouteObj.WorkflowJobTemplateScheduleDetails,
  projects: RouteObj.ProjectScheduleDetails,
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

const createRuleRoutes: { [key: string]: string } = {
  inventories: RouteObj.InventorySourceCreateScheduleRules,
  job_template: RouteObj.JobTemplateCreateScheduleRules,
  workflow_job_templates: RouteObj.WorkflowJobTemplateCreateScheduleRules,
  projects: RouteObj.ProjectCreateScheduleRules,
};

export function useGetCreateRuleRoute() {
  const params = useParams<{ id: string; schedule_id: string; source_id?: string }>();
  const location = useLocation();
  const resource_type = scheduleResourceTypeOptions.find((resourceType) =>
    location.pathname.split('/').includes(resourceType)
  );
  let createUrl = '';
  if (resource_type && params?.id && params.schedule_id) {
    if (resource_type === 'inventories' && params?.source_id) {
      createUrl = RouteObj.InventorySourceCreateScheduleRules.replace(':id', `${params.id}`)
        .replace(':source_id', `${params.source_id}`)
        .replace(':schedule_id', `${params.schedule_id}`);
    }
    createUrl = createRuleRoutes[resource_type]
      .replace(':id', `${params.id}`)
      .replace(':schedule_id', `${params.schedule_id}`);
  }
  return createUrl;
}
