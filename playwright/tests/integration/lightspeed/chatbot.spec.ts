import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Lightspeed } from '@ansible/playwright/utils';
import {
  waitForChatbotResponse,
  waitForRagReferenceInLastMessage,
} from '@ansible/playwright/utils/lightspeed';
import { platformUI } from '@ansible/playwright/commands/login';

test.describe('Chatbot', () => {
  test.beforeEach(setupBefore({ path: '/' }));
  test.afterEach(setupAfter);
  test.setTimeout(1 * 60 * 1000);

  test(
    'should display the Chatbot, add a question and hide',
    { tag: ['@tier1'] },
    async ({ page }) => {
      await Lightspeed.mock.healthStatus(page, 200, {
        'chatbot-service': 'ok',
        'streaming-chatbot-service': 'ok',
      });

      await page.reload({ waitUntil: 'networkidle' });
      const chatbotBadge = page.locator('[data-testid="chatbot-badge"]');
      await expect(chatbotBadge).toBeVisible();
      await chatbotBadge.click();
      const chatbotIFrame = page.frameLocator('iframe[title="Ansible Chatbot IFrame"]');
      const chatbotTextArea = chatbotIFrame.locator('textarea[aria-label="Send a message..."]');
      await chatbotTextArea.waitFor();
      await expect(chatbotTextArea).toBeVisible();
      await chatbotTextArea.fill('what is ansible ?');

      await page.locator('[data-testid="chatbot-badge"]').click();
      await expect(chatbotTextArea).not.toBeVisible();
    }
  );

  test(
    'should hide chatbot badge when the chatbot service is disabled',
    { tag: ['@tier1'] },
    async ({ page }) => {
      await Lightspeed.mock.healthStatus(page, 200, {
        'chatbot-service': 'disabled',
        'streaming-chatbot-service': 'disabled',
      });
      // click platform Overview menu item to make sure the application elements are fully loaded and clickable
      await page.reload({ waitUntil: 'networkidle' });
      const chatbotBadge = page.locator('[data-testid="chatbot-badge"]');
      await expect(chatbotBadge).not.toBeVisible();
    }
  );

  test(
    'should hide the chatbot badge when health status request return an error',
    { tag: ['@tier1'] },
    async ({ page }) => {
      await Lightspeed.mock.healthStatus(page, 200, {
        'chatbot-service': 'an error occurred',
        'streaming-chatbot-service': 'an error occurred',
      });

      // click platform Overview menu item to make sure the application elements are fully loaded and clickable
      await page.reload({ waitUntil: 'networkidle' });
      const chatbotBadge = page.locator('[data-testid="chatbot-badge"]');
      await expect(chatbotBadge).not.toBeVisible();
    }
  );

  test(
    'should have RAG conversation return a meaningful response',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      test.setTimeout(120000);

      const healthResponse = await page.request.get(
        `${platformUI}/api/lightspeed/v1/health/status/chatbot/`
      );

      if (healthResponse.status() === 404) {
        test.skip(true, 'Lightspeed is not deployed');
      }
      expect(healthResponse.status(), 'Chatbot health check should return 200').toBe(200);
      const healthBody = (await healthResponse.json()) as Record<string, string>;
      expect(healthBody['chatbot-service'], 'Chatbot service should be ok').toBe('ok');
      expect(healthBody['streaming-chatbot-service'], 'Streaming service should be ok').toBe('ok');

      const chatbotBadge = page.locator('[data-testid="chatbot-badge"]');
      await expect(chatbotBadge).toBeVisible({ timeout: 5000 });

      // Build a list of AAP-related questions and pick one at random
      const aapQuestions = [
        'What is the Ansible Automation Platform?',
        'How do I create a new project in Ansible Automation Platform?',
        'What is an automation controller in AAP?',
        'How can I schedule jobs using AAP?',
        'What are execution environments in the context of AAP?',
        'How do I set up credentials in Ansible Automation Platform?',
        'Explain what an inventory is in AAP.',
        'How can I monitor job runs in AAP?',
        'What are the main features of AAP?',
        'How do I manage collections in Ansible Automation Platform?',
      ];
      const randomIndex = Math.floor(Math.random() * aapQuestions.length);
      const randomQuestion = aapQuestions[randomIndex];

      // Open chatbot and send a RAG query
      await chatbotBadge.click();
      // Wait for a few seconds to ensure the chatbot window is fully loaded
      await page.waitForTimeout(1000);
      const chatbotIFrame = page.frameLocator('iframe[title="Ansible Chatbot IFrame"]');
      const chatbotTextArea = chatbotIFrame.locator('textarea[aria-label="Send a message..."]');
      await chatbotTextArea.waitFor({ timeout: 5000 });
      await chatbotTextArea.fill(randomQuestion);
      await chatbotIFrame.locator('button[aria-label="Send"]').click();

      // Wait for bot response to render
      const responseText = await waitForRagReferenceInLastMessage(chatbotIFrame);

      expect(
        responseText,
        `Response should not contain an error. Got: ${responseText.substring(0, 300)}`
      ).not.toContain('Bot returned status_code');
    }
  );

  test(
    'should have MCP conversation return a meaningful response',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const healthResponse = await page.request.get(
        `${platformUI}/api/lightspeed/v1/health/status/chatbot/`
      );

      if (healthResponse.status() === 404) {
        test.skip(true, 'Lightspeed is not deployed');
      }
      expect(healthResponse.status(), 'Chatbot health check should return 200').toBe(200);
      const healthBody = (await healthResponse.json()) as Record<string, string>;
      expect(healthBody['chatbot-service'], 'Chatbot service should be ok').toBe('ok');
      expect(healthBody['streaming-chatbot-service'], 'Streaming service should be ok').toBe('ok');

      const chatbotBadge = page.locator('[data-testid="chatbot-badge"]');
      await expect(chatbotBadge).toBeVisible({ timeout: 5000 });

      // Open chatbot and send an MCP query
      await chatbotBadge.click();
      await page.waitForTimeout(1000);
      const chatbotIFrame = page.frameLocator('iframe[title="Ansible Chatbot IFrame"]');
      const chatbotTextArea = chatbotIFrame.locator('textarea[aria-label="Send a message..."]');
      await chatbotTextArea.waitFor({ timeout: 5000 });
      await chatbotTextArea.fill('How many job templates are in my Automation Controller?');
      await chatbotIFrame.locator('button[aria-label="Send"]').click();

      // Wait for bot response to render
      const responseText = await waitForChatbotResponse(chatbotIFrame);

      expect(
        responseText,
        `Response should not contain an error. Got: ${responseText.substring(0, 300)}`
      ).not.toContain('Bot returned status_code');

      // Cross-check: get the real job template count from the controller API
      const jtResponse = await page.request.get(`${platformUI}/api/controller/v2/job_templates/`);
      expect(jtResponse.status()).toBe(200);
      const jtBody = (await jtResponse.json()) as { count: number };
      const actualCount = jtBody.count;
      // The chatbot response should mention the real count
      expect(
        responseText,
        `MCP response should mention the actual job template count (${actualCount})`
      ).toContain(actualCount.toString());
    }
  );
});
