import { klona } from 'klona/json';
import { filterItems, paginateItems, sortItems } from '../handlers/getItems';
import { MockRequest, MockResponse } from '../mock-router';
import { controllerRelations } from './controllerRelations';

export function getUnifiedJobs(request: MockRequest): MockResponse {
  const jobs = request.context.data.api.controller.v2.jobs;
  const workflowJobs = request.context.data.api.controller.v2.workflow_jobs;
  let results: unknown[] = klona([...jobs, ...workflowJobs]).map((item) =>
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
