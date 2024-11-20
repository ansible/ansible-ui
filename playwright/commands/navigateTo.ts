import { Locator, Page, expect } from '@playwright/test';

export async function navigateTo(page: Page, ...labels: string[]) {
  const nav = page.locator('.pf-v5-c-nav');
  await expect(nav).toBeVisible();

  let listItem: Locator | undefined = undefined;
  for (const label of labels) {
    if (!listItem) {
      listItem = nav.locator('li').filter({ hasText: label });
    } else {
      listItem = listItem.locator('li').filter({ hasText: label });
    }
    await expect(listItem).toBeVisible();

    const isLastLabel = label === labels[labels.length - 1];
    if (isLastLabel) {
      await listItem.getByRole('link').click();
    } else {
      if (!(await listItem.evaluate((el) => el.classList.contains('pf-m-expanded')))) {
        await listItem.getByRole('button').click();
      }
    }
  }

  const lastLabel = labels[labels.length - 1];
  await expect(page.getByRole('heading', { name: lastLabel }).first()).toBeVisible();
}
