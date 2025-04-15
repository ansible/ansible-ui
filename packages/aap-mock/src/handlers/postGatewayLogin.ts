import { MockRequest, MockResponse } from '../mock-router';

export function postGatewayLogin(request: MockRequest): MockResponse {
  const { username } = request.body as { username: string };
  const users = request.context.data.api.gateway.v1.users;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }
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
