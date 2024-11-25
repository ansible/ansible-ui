import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';

export function postGatewayLogin({ mockData: data }: RouteOptions): MockResponse {
  const user = {
    id: 1,
    username: 'mock',
    is_superuser: true,
    summary_fields: { resource: { ansible_id: '1' } },
  };
  data.api.gateway.v1.me = [user];
  data.api.gateway.v1.legacy_auth = {
    id: user?.id,
    username: user?.username,
    is_authenticated: true,
    needs_rename: false,
    is_migrated: true,
    linked_accounts: [],
  };
  data.api.controller.v2.me = [user];
  return { status: 200, body: user };
}
