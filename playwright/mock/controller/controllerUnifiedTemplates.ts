import { klona } from 'klona/json';
import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';
import { controllerRelations } from './controllerRelations';

export function getUnifiedTemplates({ data }: RouteOptions): MockResponse {
  const jobTemplates = data.api.controller.v2.job_templates;
  const workflowJobTemplates = data.api.controller.v2.workflow_job_templates;
  return {
    status: 200,
    body: {
      count: jobTemplates.length + workflowJobTemplates.length,
      results: klona([...jobTemplates, ...workflowJobTemplates]).map((item) =>
        controllerRelations(item, data)
      ),
    },
  };
}
