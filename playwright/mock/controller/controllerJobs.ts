import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';

export function getJobEvents(_options: RouteOptions): MockResponse {
  // const { params } = options;
  // const jobID = params.id as unknown as number;
  // const job = data.api.controller.v2.jobs.find((job) => job.id == jobID);
  const body = { count: 0, next: null, previous: null, results: [] };
  return { status: 200, body };
}

export function getJobEventsChildrenSummary(options: RouteOptions): MockResponse {
  const { params } = options;
  const _id = params.id;
  return {
    status: 200,
    body: {},
  };
}
