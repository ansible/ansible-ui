import { TOPOLOGY_AZURE, TOPOLOGY_SAAS } from '@ansible/playwright/commands/constants';
import { isSaaS, isTopology } from '@ansible/playwright/commands/getTopologyType';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

type ServiceVersionJson = { version: string };
type HubRootJson = { galaxy_ng_version: string };

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Platform Header Toolbar - Help Menu', () => {
  test(
    'should conditionally display based on topology type',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const awxConfigPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/controller/v2/ping/') &&
          response.request().method() === 'GET'
      );
      const hubConfigPromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/galaxy/') && response.request().method() === 'GET'
      );
      const edaConfigPromise = isSaaS()
        ? null
        : page.waitForResponse(
            (response) =>
              response.url().includes('/api/eda/v1/config/') &&
              response.request().method() === 'GET'
          );

      await page.locator('#help-menu-menu-toggle').click();

      if (isTopology(TOPOLOGY_SAAS, TOPOLOGY_AZURE)) {
        await expect(page.locator('[data-testid="masthead-quickstarts"]')).not.toBeVisible();
      } else {
        const quickStartsItem = page.locator('[data-testid="masthead-quickstarts"]');
        await expect(quickStartsItem).toBeVisible();
        await expect(quickStartsItem).toContainText('Quick starts');
      }

      await page.locator('[data-testid="masthead-about"]').click();
      const awxResponse = await awxConfigPromise;
      const hubResponse = await hubConfigPromise;
      const awxConfig = (await awxResponse.json()) as ServiceVersionJson;
      const hubConfig = (await hubResponse.json()) as HubRootJson;
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await expect(modal.getByText(/Ansible Automation Platform/)).toBeVisible();
      await expect(modal.getByText(/Copyright.*Red Hat/)).toBeVisible();
      await expect(modal.getByText('Automation Controller Version')).toBeVisible();
      if (awxConfig.version) {
        await expect(modal.getByText(awxConfig.version, { exact: true })).toBeVisible();
      }
      await expect(modal.getByText('Automation Hub Version')).toBeVisible();
      if (hubConfig.galaxy_ng_version) {
        await expect(modal.getByText(hubConfig.galaxy_ng_version, { exact: true })).toBeVisible();
      }
      if (edaConfigPromise) {
        const edaResponse = await edaConfigPromise;
        const edaConfig = (await edaResponse.json()) as ServiceVersionJson;
        await expect(modal.getByText('Event-Driven Ansible Version')).toBeVisible();
        if (edaConfig.version) {
          await expect(modal.getByText(edaConfig.version, { exact: true })).toBeVisible();
        }
      }
    }
  );
});
