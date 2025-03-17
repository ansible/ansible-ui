import { Page } from '@playwright/test';

/**
 * Clicks the kebab icon attached to a particular node in the workflow visualizer.
 * Receives the text of the node's label input as a string.
 *
 * @param nodeText
 * @param page
 */
export async function toggleNodeKebab(nodeText: string, page: Page) {
  await page
    .locator('[class*="topology__node__label"]', { hasText: nodeText })
    .locator('[class*="action-icon__icon"]')
    .click();
}
