import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Authentication } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test.describe('Authenticator mappings', { tag: ['@tier1'] }, () => {
  test('can reorder mappings', async ({ page }) => {
    const authenticatorName = await Authentication.ui.createMethod(page, {});
    const mapName1 = await Authentication.ui.createMap(page, {
      authenticatorName,
      name: 'alpha',
    });
    const mapName2 = await Authentication.ui.createMap(page, {
      authenticatorName,
      name: 'beta',
    });
    const mapName3 = await Authentication.ui.createMap(page, {
      authenticatorName,
      name: 'gamma',
    });

    await expect(page.getByRole('link', { name: mapName3 })).toBeVisible();

    await page.reload();

    await page.getByRole('button', { name: 'Manage mappings' }).click();

    await expect(page.getByRole('heading', { name: 'Manage mappings' })).toBeVisible();

    await expect(
      page.getByRole('row', { name: `Draggable row draggable button ${mapName1}` })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('row', { name: `Draggable row draggable button ${mapName2}` })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('row', { name: `Draggable row draggable button ${mapName3}` })
    ).toBeVisible({ timeout: 10000 });

    const sourceRow = page.getByRole('row', { name: `Draggable row draggable button ${mapName1}` });
    const targetRow = page.getByRole('row', { name: `Draggable row draggable button ${mapName3}` });
    await sourceRow.getByLabel('Draggable row draggable button').dragTo(targetRow);

    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByRole('row').nth(1)).toContainText(mapName2);
    await expect(page.getByRole('row').nth(2)).toContainText(mapName3);
    await expect(page.getByRole('row').nth(3)).toContainText(mapName1);

    await Authentication.ui.deleteMethod(page, authenticatorName);
  });

  test('can create attribute trigger mappings', async ({ page }) => {
    const authenticatorName = await Authentication.ui.createMethod(page, {});
    const mapName = await Authentication.ui.createMap(page, {
      authenticatorName,
      name: 'triggerOne',
      trigger: 'Attributes',
    });
    await expect(page.getByRole('link', { name: mapName })).toBeVisible();
  });
});
