import { MockRequest, MockResponse } from '../mock-router';

export function getJobEvents(_options: MockRequest): MockResponse {
  // const { params } = options;
  // const jobID = params.id as unknown as number;
  // const job = data.api.controller.v2.jobs.find((job) => job.id == jobID);
  const body = { count: 0, next: null, previous: null, results: [] };
  return { status: 200, body };
}

export function getJobEventsChildrenSummary(_request: MockRequest): MockResponse {
  // const { params } = options;
  // const _id = params.id;
  return {
    status: 200,
    body: {},
  };
}
