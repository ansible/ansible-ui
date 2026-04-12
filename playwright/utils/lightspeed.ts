import { LightspeedStatusResponse } from '@ansible/chatbot/interfaces/LightspeedStatus';
import { Page } from '@playwright/test';
import { platformUI } from '../commands/login';
import type { FrameLocator } from '@playwright/test';
import { expect } from '@playwright/test';

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

export async function waitForChatbotResponse(
  chatbotIFrame: FrameLocator,
  timeout = 60000
): Promise<string> {
  const messageboxes = chatbotIFrame.locator('.pf-chatbot__content');
  const lastMessagebox = messageboxes.last();
  await expect(lastMessagebox).toBeVisible({ timeout });

  await expect(async () => {
    const textBeforeWait = await lastMessagebox.textContent();
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const textAfterWait = await lastMessagebox.textContent();
    expect(textBeforeWait).not.toContain('Loading message');
    expect(textBeforeWait).toBe(textAfterWait);
    expect(textBeforeWait).toBeTruthy();
  }).toPass({ timeout });
  return (await lastMessagebox.textContent()) ?? '';
}

export const RAG_REFERENCE_MARKER = 'Refer to the following for more information:';
export const RAG_REFERENCE_POLL_INTERVAL_MS = 2000;
export async function waitForRagReferenceInLastMessage(
  chatbotIFrame: FrameLocator,
  timeoutMs = 60_000
): Promise<string> {
  const lastMessagebox = chatbotIFrame.locator('.pf-chatbot__content').last();

  await expect
    .poll(
      async () => {
        try {
          return (await lastMessagebox.textContent()) ?? '';
        } catch {
          return '';
        }
      },
      {
        timeout: timeoutMs,
        intervals: [RAG_REFERENCE_POLL_INTERVAL_MS],
        message: `Timed out after ${timeoutMs}ms waiting for RAG reference (${RAG_REFERENCE_MARKER})`,
      }
    )
    .toContain(RAG_REFERENCE_MARKER);

  return (await lastMessagebox.textContent()) ?? '';
}
