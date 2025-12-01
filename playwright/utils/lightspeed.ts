import { LightspeedStatusResponse } from '@ansible/chatbot/interfaces/LightspeedStatus';
import { Page } from '@playwright/test';
import { platformUI } from '../commands/login';

export const Lightspeed = {
  mock: {
    /**
     * Mock lightspeed health status request call
     * Used in tests to simulate different Lightspeed service states
     */
    healthStatus: async (
      page: Page,
      status: number,
      responseData: LightspeedStatusResponse | string
    ): Promise<void> => {
      await page.route(
        platformUI + '/api/lightspeed/v1/health/status/chatbot/',
        async (route) =>
          await route.fulfill({
            status: status,
            contentType: 'application/json',
            body: JSON.stringify(responseData),
          })
      );
    },
  },
} as const;
