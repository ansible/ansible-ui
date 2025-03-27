import { klona } from 'klona/json';
import { filterItems, paginateItems, sortItems } from '../handlers/getItems';
import { MockRequest, MockResponse } from '../mock-router';
import { controllerRelations } from './controllerRelations';

export function getUnifiedTemplates(request: MockRequest): MockResponse {
  const jobTemplates = request.context.data.api.controller.v2.job_templates;
  const workflowJobTemplates = request.context.data.api.controller.v2.workflow_job_templates;
  let results: unknown[] = klona([...jobTemplates, ...workflowJobTemplates]).map((item) =>
    controllerRelations(item, request.context.data)
  );
  results = filterItems(results, request.url.searchParams);
  results = sortItems(results, request.url.searchParams);
  results = paginateItems(results, request.url.searchParams);
  return {
    status: 200,
    body: {
      count: results.length,
      results,
    },
  };
}
