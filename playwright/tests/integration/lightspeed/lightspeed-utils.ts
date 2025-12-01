/** @deprecated Use Lightspeed from '@ansible/playwright/utils' instead */

import { LightspeedStatusResponse } from '@ansible/chatbot/interfaces/LightspeedStatus';
import { Page } from '@playwright/test';
import { platformUI } from '@ansible/playwright/commands/login';

/** @deprecated Use Lightspeed.mock.healthStatus() from '@ansible/playwright/utils' */
export async function mockLightspeedHealthStatus(
  page: Page,
  status: number,
  responseData: LightspeedStatusResponse | string
) {
  await page.route(
    platformUI + '/api/lightspeed/v1/health/status/chatbot/',
    async (route) =>
      await route.fulfill({
        status: status,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      })
  );
}
