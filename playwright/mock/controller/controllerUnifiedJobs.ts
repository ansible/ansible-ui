import { klona } from 'klona/json';
import { filterItems, paginateItems, sortItems } from '../handlers/getItems';
import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';
import { controllerRelations } from './controllerRelations';

export function getUnifiedJobs({ mockData: data, url }: RouteOptions): MockResponse {
  const jobs = data.api.controller.v2.jobs;
  const workflowJobs = data.api.controller.v2.workflow_jobs;
  let results: unknown[] = klona([...jobs, ...workflowJobs]).map((item) =>
    controllerRelations(item, data)
  );
  results = filterItems(results, url.searchParams);
  results = sortItems(results, url.searchParams);
  results = paginateItems(results, url.searchParams);
  return {
    status: 200,
    body: {
      count: results.length,
      results,
    },
  };
}
