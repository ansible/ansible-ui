/* eslint-disable no-empty */
import { Route } from '@playwright/test';
import { MockContext } from './context/context';
import { MockRequest, Router } from './mock-router';

export function handleRoute(
  route: Route,
  router: Router,
  data: MockContext['data'],
  options: MockContext['options']
) {
  const request: MockRequest = {
    method: route.request().method(),
    url: new URL(route.request().url()),
    headers: route.request().headers(),
    context: { data, options },
    params: {},
  };
  if (typeof route.request().postData() === 'string') {
    try {
      request.body = JSON.parse(route.request().postData()!) as Record<string, unknown>;
    } catch (e) {}
  }

  const response = router.handle(request);
  return route.fulfill({
    status: response.status ? response.status : response.body ? 200 : 501,
    headers: response.headers,
    json: response.body,
  });
}
