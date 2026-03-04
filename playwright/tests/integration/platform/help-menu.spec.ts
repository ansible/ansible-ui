import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '@ansible/playwright/commands/constants';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

// Type definitions for API responses
interface AwxConfig {
  version: string;
  [key: string]: unknown;
}

interface HubConfig {
  galaxy_ng_version: string;
  [key: string]: unknown;
}

interface EdaConfig {
  version: string;
  [key: string]: unknown;
}

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Platform Header Toolbar - Help Menu', () => {
  test.describe('Help Menu Toggle and Display', () => {
    test(
      'should display button with correct initial state and toggle open/closed',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        // Initial state - button should be visible and closed
        const helpMenuToggle = page.locator('#help-menu-menu-toggle');
        await expect(helpMenuToggle).toBeVisible();
        await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'false');
        // Open menu
        await helpMenuToggle.click();
        await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'true');
        // Verify menu items are visible
        await expect(page.locator('[data-testid="masthead-documentation"]')).toBeVisible();
        await expect(page.locator('[data-testid="masthead-about"]')).toBeVisible();
        // Close menu by clicking toggle again
        await helpMenuToggle.click();
        await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'false');
        // Verify menu is closed
        await expect(page.locator('[data-testid="masthead-documentation"]')).not.toBeVisible();
      }
    );
  });

  test.describe('Menu Items', () => {
    test(
      'menu should display documentation link with correct attributes',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        // Open help menu
        await page.locator('#help-menu-menu-toggle').click();
        // Verify documentation item
        const docItem = page.locator('[data-testid="masthead-documentation"]');
        await expect(docItem).toBeVisible();
        await expect(docItem).toContainText('Documentation');
        // Verify link attributes
        const docLink = docItem.locator('a');
        await expect(docLink).toHaveAttribute(
          'href',
          'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform'
        );
      }
    );
  });

  test.describe('Quick Starts', () => {
    test(
      'should conditionally display based on build type',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const buildType = await checkBuildType(page);
        // Open help menu
        await page.locator('#help-menu-menu-toggle').click();
        if (buildType === SAAS_URL || buildType === AZURE_URL) {
          // Quick starts should NOT exist in SaaS/Azure builds
          await expect(page.locator('[data-testid="masthead-quickstarts"]')).not.toBeVisible();
        } else {
          // Quick starts should exist in other builds
          const quickStartsItem = page.locator('[data-testid="masthead-quickstarts"]');
          await expect(quickStartsItem).toBeVisible();
          await expect(quickStartsItem).toContainText('Quick starts');
        }
      }
    );

    test(
      'should navigate to quick starts page and close menu',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const buildType = await checkBuildType(page);
        // Skip for SaaS/Azure
        if (buildType === SAAS_URL || buildType === AZURE_URL) {
          test.skip();
          return;
        }
        // Open help menu
        const helpMenuToggle = page.locator('#help-menu-menu-toggle');
        await helpMenuToggle.click();
        // Click quick starts
        await page.locator('[data-testid="masthead-quickstarts"]').click();
        // Verify navigation occurred
        await expect(page).toHaveURL(/\/quickstarts/);
        // Verify menu closed after navigation
        await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'false');
        // Verify quick starts page loaded
        await expect(
          page.getByRole('heading', { name: 'Quick Starts', exact: true })
        ).toBeVisible();
        await expect(
          page.getByText('Learn Ansible automation with hands-on quickstarts.')
        ).toBeVisible();
      }
    );
  });

  test.describe('About Modal: Content Display', () => {
    test(
      'should display complete content with versions from APIs',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const buildType = await checkBuildType(page);
        // Set up API intercepts
        const awxConfigPromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/controller/v2/ping/') &&
            response.request().method() === 'GET'
        );
        const hubConfigPromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/galaxy/') && response.request().method() === 'GET'
        );
        // Open help menu and click About
        await page.locator('#help-menu-menu-toggle').click();
        await page.locator('[data-testid="masthead-about"]').click();
        // Wait for API responses
        const awxResponse = await awxConfigPromise;
        const hubResponse = await hubConfigPromise;
        const awxConfig = (await awxResponse.json()) as AwxConfig;
        const hubConfig = (await hubResponse.json()) as HubConfig;
        // Verify modal is visible
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        // Verify modal title/branding
        await expect(modal.getByText(/Ansible Automation Platform/)).toBeVisible();
        // Verify trademark/copyright
        await expect(modal.getByText(/Copyright.*Red Hat/)).toBeVisible();
        // Verify Automation Controller Version
        await expect(modal.getByText('Automation Controller Version')).toBeVisible();
        if (awxConfig.version) {
          await expect(modal.getByText(awxConfig.version, { exact: true })).toBeVisible();
        }
        // Verify Automation Hub Version
        await expect(modal.getByText('Automation Hub Version')).toBeVisible();
        if (hubConfig.galaxy_ng_version) {
          await expect(modal.getByText(hubConfig.galaxy_ng_version, { exact: true })).toBeVisible();
        }
        // For non-SaaS builds, verify EDA version
        if (buildType !== SAAS_URL) {
          const edaConfigPromise = page.waitForResponse(
            (response) =>
              response.url().includes('/api/eda/v1/config/') &&
              response.request().method() === 'GET'
          );
          const edaResponse = await edaConfigPromise;
          const edaConfig = (await edaResponse.json()) as EdaConfig;
          await expect(modal.getByText('Event-Driven Ansible Version')).toBeVisible();
          if (edaConfig.version) {
            await expect(modal.getByText(edaConfig.version, { exact: true })).toBeVisible();
          }
        }
      }
    );
  });

  test.describe('About Modal: Brand Logo', () => {
    test('should display brand logo with alt text', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();

      const modal = page.getByRole('dialog');
      const brandLogo = modal.locator('img[alt="Brand Logo"]');

      await expect(brandLogo).toBeVisible();
      await expect(brandLogo).toHaveAttribute('alt', 'Brand Logo');
      await expect(brandLogo).toHaveAttribute('src', /platform-logo.*\.svg$/);
    });

    test('should use white logo for dark theme', { tag: ['@not_mock'] }, async ({ page }) => {
      const themeButton = page.locator('[data-cy="theme-icon"]');
      await expect(themeButton).toBeVisible();
      await themeButton.click();

      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();

      const modal = page.getByRole('dialog');
      const brandLogo = modal.locator('img[alt="Brand Logo"]');

      await expect(brandLogo).toHaveAttribute('src', '/assets/platform-logo-white.svg');
    });

    test('should use standard logo for light theme', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();

      const modal = page.getByRole('dialog');
      const brandLogo = modal.locator('img[alt="Brand Logo"]');

      await expect(brandLogo).toHaveAttribute('src', '/assets/platform-logo.svg');
    });
  });

  test.describe('About Modal: User Interactions', () => {
    test('should close using X button', { tag: ['@not_mock'] }, async ({ page }) => {
      // Open about modal
      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      // Click close button
      await modal.locator('button[aria-label*="Close"]').first().click();
      await expect(modal).not.toBeVisible();
    });

    test('should close using ESC key', { tag: ['@not_mock'] }, async ({ page }) => {
      // Open about modal
      await page.locator('#help-menu-menu-toggle').click();
      await page.locator('[data-testid="masthead-about"]').click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      // Press ESC
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', { tag: ['@not_mock'] }, async ({ page }) => {
      // Focus help menu button
      const helpMenuToggle = page.locator('#help-menu-menu-toggle');
      await helpMenuToggle.focus();
      await expect(helpMenuToggle).toBeFocused();
      // Open with Enter key
      await page.keyboard.press('Enter');
      await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('[data-testid="masthead-documentation"]')).toBeVisible();
      // Close with Escape key
      await page.keyboard.press('Escape');
      await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'false');
      // Open with Space key
      await helpMenuToggle.focus();
      await page.keyboard.press('Space');
      await expect(helpMenuToggle).toHaveAttribute('aria-expanded', 'true');
      // Close again
      await page.keyboard.press('Escape');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on tablet viewport', { tag: ['@not_mock'] }, async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      const helpMenuToggle = page.locator('#help-menu-menu-toggle');
      await expect(helpMenuToggle).toBeVisible();
      await helpMenuToggle.click();
      await expect(page.locator('[data-testid="masthead-documentation"]')).toBeVisible();
      await expect(page.locator('[data-testid="masthead-about"]')).toBeVisible();
    });
  });
});
