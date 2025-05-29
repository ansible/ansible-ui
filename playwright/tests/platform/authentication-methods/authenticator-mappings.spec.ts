import { expect, test } from '@playwright/test';
import { setupBefore, setupAfter } from '../../../commands/setup';
import {
  createAuthenticationMethod,
  createAuthenticationMap,
  deleteAuthenticationMethod,
} from './authentication-utils';

test.beforeEach(setupBefore({ path: '/access/authenticators' }));
test.afterEach(setupAfter);

test.describe('Authenticator mappings', () => {
  test('can reorder mappings', async ({ page }) => {
    const authenticatorName = await createAuthenticationMethod({}, page);
    const mapName1 = await createAuthenticationMap(
      {
        authenticatorName,
        name: 'alpha',
      },
      page
    );
    const mapName2 = await createAuthenticationMap(
      {
        authenticatorName,
        name: 'beta',
      },
      page
    );
    const mapName3 = await createAuthenticationMap(
      {
        authenticatorName,
        name: 'gamma',
      },
      page
    );

    await expect(page.getByRole('link', { name: mapName3 })).toBeVisible();
    await page.getByRole('button', { name: 'Manage mappings' }).click();
    await page
      .getByRole('row', { name: `Draggable row draggable button ${mapName1}` })
      .getByLabel('Draggable row draggable button')
      .dragTo(page.locator(getId(mapName3)));
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByRole('row').nth(1)).toContainText(mapName2);
    await expect(page.getByRole('row').nth(2)).toContainText(mapName3);
    await expect(page.getByRole('row').nth(3)).toContainText(mapName1);

    await deleteAuthenticationMethod(authenticatorName, page);
  });

  test('can create attribute trigger mappings', async ({ page }) => {
    const authenticatorName = await createAuthenticationMethod({}, page);
    const mapName = await createAuthenticationMap(
      {
        authenticatorName,
        name: 'triggerOne',
        trigger: 'Attributes',
      },
      page
    );
    await expect(page.getByRole('link', { name: mapName })).toBeVisible();
  });
});

function getId(name: string) {
  return `#${name.toLowerCase().replace(/\s/g, '-')}`;
}
