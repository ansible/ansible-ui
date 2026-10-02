import { Page } from '@playwright/test';

/**
 * Clicks the kebab icon attached to a particular node in the workflow visualizer.
 * Receives the text of the node's label input as a string.
 *
 * @param nodeText
 * @param page
 */
export async function toggleNodeKebab(nodeText: string, page: Page) {
  // The topology canvas truncates long node labels in the DOM (e.g. "E2E jt-… abc1234").
  // The unique UUID suffix (last word) is always preserved, so use it for reliable matching.
  const uniqueSuffix = nodeText.split(' ').at(-1) ?? nodeText;

  // Fit to screen so the target node is fully inside the canvas visible area.
  // Without this the action icon can be clipped by pf-v6-c-drawer__main and mouse clicks miss.
  const fitBtn = page.getByRole('button', { name: 'Fit to Screen' });
  if (await fitBtn.isVisible()) {
    await fitBtn.click();
    // Wait for the canvas to finish re-rendering after the zoom/pan reset.
    await page.waitForTimeout(1000);
  }

  const nodeLabel = page.locator('[class*="topology__node__label"]', { hasText: uniqueSuffix });
  await nodeLabel.waitFor({ state: 'visible' });

  // Use raw mouse movement so the SVG topology receives real pointer events.
  const labelBox = await nodeLabel.boundingBox();
  if (!labelBox) throw new Error(`Node label not found for: ${nodeText}`);
  await page.mouse.move(labelBox.x + labelBox.width / 2, labelBox.y + labelBox.height / 2);

  const icon = nodeLabel.locator('[class*="action-icon__icon"]');
  await icon.waitFor({ state: 'visible' });
  const iconBox = await icon.boundingBox();
  if (!iconBox) throw new Error(`Action icon not found for node: ${nodeText}`);

  // Move to icon center and click; retry once if menu doesn't open immediately
  await page.mouse.move(iconBox.x + iconBox.width / 2, iconBox.y + iconBox.height / 2);
  await page.waitForTimeout(200);
  await page.mouse.click(iconBox.x + iconBox.width / 2, iconBox.y + iconBox.height / 2);
}
