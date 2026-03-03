import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Lightspeed } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);
test.setTimeout(2 * 60 * 1000);
test.skip(
  'chatbot - should display the Chatbot, add a question and hide',
  { tag: [] },
  async ({ page }) => {
    test.setTimeout(8 * 60 * 1000);
    await Lightspeed.mock.healthStatus(page, 200, {
      'chatbot-service': 'ok',
      'streaming-chatbot-service': 'ok',
    });

    const chatbotBadge = page.locator('[data-cy="chatbot-badge"]');
    await expect(chatbotBadge).toBeVisible();
    // display the chatbot
    await chatbotBadge.click();
    const chatbotIFrame = page.frameLocator('iframe[title="Ansible Chatbot IFrame"]');
    const chatbotTextArea = chatbotIFrame.locator('textarea[aria-label="Send a message..."]');
    await chatbotTextArea.waitFor();
    await expect(chatbotTextArea).toBeVisible();
    // add a question
    await chatbotTextArea.fill('what is ansible ?');

    // hide the chatbot
    await page.locator('[data-cy="chatbot-badge"]').click();
    await expect(chatbotTextArea).not.toBeVisible();
  }
);

test(
  'chatbot - the chatbot badge is not displayed when the chatbot service is disabled',
  { tag: [] },
  async ({ page }) => {
    test.setTimeout(5 * 60 * 1000);
    await Lightspeed.mock.healthStatus(page, 200, {
      'chatbot-service': 'disabled',
      'streaming-chatbot-service': 'disabled',
    });
    // click platform Overview menu item to make sure the application elements are fully loaded and clickable
    await page.getByRole('link', { name: 'Overview' }).click();
    const chatbotBadge = page.locator('[data-cy="chatbot-badge"]');
    await expect(chatbotBadge).not.toBeVisible();
  }
);

test(
  'chatbot - the chatbot badge is not displayed when health status request return an error',
  { tag: [] },
  async ({ page }) => {
    test.setTimeout(5 * 60 * 1000);
    await Lightspeed.mock.healthStatus(page, 200, {
      'chatbot-service': 'an error occurred',
      'streaming-chatbot-service': 'an error occurred',
    });

    // click platform Overview menu item to make sure the application elements are fully loaded and clickable
    await page.getByRole('link', { name: 'Overview' }).click();
    const chatbotBadge = page.locator('[data-cy="chatbot-badge"]');
    await expect(chatbotBadge).not.toBeVisible();
  }
);
