import { Route } from '@playwright/test';
import { IApiData } from '../mockData';
import { mockOptions } from '../mockOptions';
import { Router } from '../router/Router';

export function handleRoute(
  route: Route,
  router: Router,
  data: IApiData,
  options: typeof mockOptions
) {
  const response = router.handle(route, data, options);
  return route.fulfill({
    status: response.status ? response.status : response.body ? 200 : 501,
    headers: response.headers,
    json: response.body,
  });
}
