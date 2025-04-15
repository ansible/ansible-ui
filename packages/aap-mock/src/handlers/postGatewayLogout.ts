import { MockRequest, MockResponse } from '../mock-router';

export function postGatewayLogout(request: MockRequest): MockResponse {
  request.context.data.api.gateway.v1.legacy_auth =
    {} as typeof request.context.data.api.gateway.v1.legacy_auth;
  request.context.data.api.gateway.v1.me = [];
  request.context.data.api.controller.v2.me = [];
  return { status: 200 };
}
