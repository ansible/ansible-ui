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

  test.describe('About Modal: Brand Logo', () => {
    test(
      'should display brand logo that loads successfully',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await page.locator('#help-menu-menu-toggle').click();
        await page.locator('[data-testid="masthead-about"]').click();

        const modal = page.getByRole('dialog');
        const brandLogo = modal.locator('img[alt="Brand Logo"]');

        await expect(brandLogo).toBeVisible();
        await expect(brandLogo).toHaveAttribute('alt', 'Brand Logo');
        const naturalWidth = await brandLogo.evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    );

    test('should load white logo for dark theme', { tag: ['@not_mock'] }, async ({ page }) => {
      const themeButton = page.locator('[data-cy="theme-icon"]');
      await expect(themeButton).toBeVisible();
      await themeButton.click();

      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();

      const modal = page.getByRole('dialog');
      const brandLogo = modal.locator('img[alt="Brand Logo"]');

      await expect(brandLogo).toBeVisible();
      const naturalWidth = await brandLogo.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    });

    test('should load standard logo for light theme', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();

      const modal = page.getByRole('dialog');
      const brandLogo = modal.locator('img[alt="Brand Logo"]');

      await expect(brandLogo).toBeVisible();
      const naturalWidth = await brandLogo.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    });
  });

  test.describe('About Modal: User Interactions', () => {
    test('should close using X button', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await modal.locator('button[aria-label*="Close"]').first().click();
      await expect(modal).not.toBeVisible();
    });

    test('should close using ESC key', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', { tag: ['@not_mock'] }, async ({ page }) => {
      const helpMenuToggle = page.locator('#help-menu-menu-toggle');
      await helpMenuToggle.focus();
      await expect(helpMenuToggle).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('[data-testid="masthead-documentation"]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'false');
      await helpMenuToggle.focus();
      await page.keyboard.press('Space');
      await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on tablet viewport', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      const helpMenuToggle = page.locator('#help-menu-menu-toggle');
      await expect(helpMenuToggle).toBeVisible();
      await helpMenuToggle.click();
      await expect(page.locator('[data-testid="masthead-documentation"]')).toBeVisible();
      await expect(page.locator('[data-testid="masthead-about"]')).toBeVisible();
    });
  });
});
