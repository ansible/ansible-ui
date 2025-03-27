import { MockRequest, MockResponse } from '../mock-router';

export function getGatewayAppUrls(request: MockRequest): MockResponse {
  const applications = request.context.data.api.gateway.v1.applications;
  return { status: 200, body: { count: applications.length, results: applications } };
}
