import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';

export function getGatewayAppUrls({ mockData: data }: RouteOptions): MockResponse {
  const applications = data.api.gateway.v1.applications;
  return { status: 200, body: { count: applications.length, results: applications } };
}
