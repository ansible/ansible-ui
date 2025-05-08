import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createEdaCredentialType, deleteEdaCredentialType } from './credential-types-utils';

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credential-types' }));
test.afterEach(setupAfter);

test(
  'eda credential types - can create a credential type and assert the info on the details page',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const credentialTypeOne = await createEdaCredentialType({}, page);
    await expect(page.locator('#name')).toContainText(credentialTypeOne);
    await deleteEdaCredentialType(credentialTypeOne, page);
  }
);
