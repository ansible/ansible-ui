import { LightspeedStatusResponse } from '@ansible/chatbot/interfaces/LightspeedStatus';
import { Page } from '@playwright/test';
import { platformUI } from '../../../commands/login';
import { lightspeedAPI } from './lightspeed-api';

/**
 * @description mock lightspeed health status request call
 * @param page
 * @param status
 * @param responseData
 */
export async function mockLightspeedHealthStatus(
  page: Page,
  status: number,
  responseData: LightspeedStatusResponse | string
) {
  await page.route(
    platformUI + lightspeedAPI('/health/status/chatbot/'),
    async (route) =>
      await route.fulfill({
        status: status,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      })
  );
}
