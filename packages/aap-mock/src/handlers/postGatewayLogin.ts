import { MockRequest, MockResponse } from '../mock-router';

export function postGatewayLogin(request: MockRequest): MockResponse {
  const user = {
    id: 1,
    username: 'mock',
    is_superuser: true,
    summary_fields: { resource: { ansible_id: '1' } },
  };
  request.context.data.api.gateway.v1.me = [
    user as unknown as (typeof request.context.data.api.gateway.v1.me)[0],
  ];
  request.context.data.api.gateway.v1.legacy_auth = {
    id: user?.id,
    username: user?.username,
    is_authenticated: true,
    needs_rename: false,
    is_migrated: true,
    linked_accounts: [],
  } as typeof request.context.data.api.gateway.v1.legacy_auth;
  request.context.data.api.controller.v2.me = [
    user as unknown as (typeof request.context.data.api.controller.v2.me)[0],
  ];
  return { status: 200, body: user };
}
