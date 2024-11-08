import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';

export function authenticatedGuard({ data }: RouteOptions): MockResponse | undefined {
  const me = data.api.gateway.v1.me;
  if (!me) return { status: 401 };
  if (me.length === 0) return { status: 401 };
  return undefined; // this allows following handlers to run
}
