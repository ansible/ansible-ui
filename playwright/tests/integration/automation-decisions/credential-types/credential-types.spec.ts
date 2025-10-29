import { expect, test } from '@playwright/test';
import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { SAAS_URL } from '@ansible/playwright/commands/constants';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { createEdaCredentialType, deleteEdaCredentialType } from './credential-types-utils';

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credential-types' }));
test.afterEach(setupAfter);

test(
  'eda credential types - can create a credential type and assert the info on the details page',
  { tag: ['@not_mock'] },
  async ({ page, request }) => {
    // Skip this test if running on SaaS deployment
    const buildType = await checkBuildType(request);
    if (buildType === SAAS_URL) {
      test.skip();
    }
    const credentialTypeOne = await createEdaCredentialType({}, page);
    await expect(page.locator('#name')).toContainText(credentialTypeOne);
    await deleteEdaCredentialType(credentialTypeOne, page);
  }
);
