/* eslint-disable no-empty */
/* eslint-disable no-console */
import { createMock, MockRequest } from '@ansible/aap-mock';
import { Page, test } from '@playwright/test';
import { platformUI } from '../commands/login';
import { logApiCallResponse } from './logger';

/** Mock API calls for Playwright tests */
export async function mock(page: Page) {
  const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;
  if (!mockEnabled) {
    page.mock = { enabled: false };
    return;
  }
  const { router, context } = createMock();
  await page.context().route(`${platformUI}/api/**/*`, (route) => {
    const request: MockRequest = {
      method: route.request().method(),
      url: new URL(route.request().url()),
      headers: route.request().headers(),
      context,
    };
    if (typeof route.request().postData() === 'string') {
      try {
        request.body = JSON.parse(route.request().postData()!) as Record<string, unknown>;
      } catch (e) {
        const formData = new URLSearchParams(route.request().postData()!);
        request.body = Object.fromEntries(formData.entries());
      }
    }
    const response = router.handle(request);
    return route.fulfill({
      status: response.status ? response.status : response.body ? 200 : 501,
      headers: response.headers,
      json: response.body,
    });
  });
  page.mock = { enabled: true, data: context.data, options: context.options, router: router };
  page.on('response', logApiCallResponse);
}
