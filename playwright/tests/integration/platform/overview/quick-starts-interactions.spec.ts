import { expect, test } from '@playwright/test';
import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '@ansible/playwright/commands/constants';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(async ({ request }) => {
  const buildType = await checkBuildType(request);
  if (buildType === SAAS_URL || buildType === AZURE_URL) {
    test.skip();
  }
});

test.beforeEach(setupBefore({ path: '/quickstarts' }));
test.afterEach(setupAfter);

test.describe('Overview - Quick Starts - State Management and Interactions', () => {
  test.describe('State Management', () => {
    test('Quick start can be reopened after closing', { tag: ['@not_mock'] }, async ({ page }) => {
      const quickStartId = 'create-organization';
      const quickStartButton = page.locator(`button[id="${quickStartId}"]`);

      await quickStartButton.click({ force: true });

      let drawer = page.locator('[data-test="quickstart drawer"]');
      await expect(drawer).toBeVisible();

      await drawer.locator('[class*="drawer__close"]').click();
      await expect(drawer).not.toBeVisible();

      await quickStartButton.click({ force: true });
      drawer = page.locator('[data-test="quickstart drawer"]');
      await expect(drawer).toBeVisible();

      await expect(
        drawer.getByRole('heading', { name: 'Create organization', level: 2 })
      ).toBeVisible();

      await drawer.locator('[class*="drawer__close"]').click();
    });

    test(
      'Multiple quick starts can be opened sequentially',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const quickStarts = ['create-organization', 'create-users', 'create-project'];

        for (const qsId of quickStarts) {
          await page.locator(`button[id="${qsId}"]`).click({ force: true });

          const drawer = page.locator('[data-test="quickstart drawer"]');
          await expect(drawer).toBeVisible();

          await drawer.locator('[class*="drawer__close"]').click();
          await expect(drawer).not.toBeVisible();
        }
      }
    );

    test(
      'Task completion marking works (success and failure)',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await page.locator('button[id="create-organization"]').click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');

        const reviewSuccess = drawer.locator('input#review-success');
        const reviewFailed = drawer.locator('input#review-failed');

        if (await reviewFailed.isVisible()) {
          await reviewFailed.click();

          const errorMessage = drawer.locator('[class*="alert__description"]');
          await expect(errorMessage).toContainText("This task isn't verified yet");

          await reviewSuccess.click();

          await expect(errorMessage).not.toBeVisible();
        }

        await drawer.locator('[class*="drawer__close"]').click();
      }
    );
  });

  test.describe('User Interactions', () => {
    test('Prerequisites section can be expanded', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('button[id="create-users"]').click({ force: true });

      const drawer = page.locator('[data-test="quickstart drawer"]');

      const prerequisitesToggle = drawer.locator('button[id*="expandable-section-toggle"]');
      await expect(prerequisitesToggle).toBeVisible({ timeout: 5000 });

      const toggleText = await prerequisitesToggle.textContent();
      expect(toggleText).toContain('Prerequisites');

      await prerequisitesToggle.click();

      const drawerText = await drawer.textContent();
      expect(drawerText).toContain('Ansible Automation Platform');

      await drawer.locator('[class*="drawer__close"]').click();
    });

    test('Drawer close button works', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('button[id="create-organization"]').click({ force: true });

      const drawer = page.locator('[data-test="quickstart drawer"]');
      await expect(drawer).toBeVisible();

      const closeButton = drawer.locator('[class*="drawer__close"]');
      await expect(closeButton).toBeVisible();

      await closeButton.click();
      await expect(drawer).not.toBeVisible();
    });

    test(
      'Side note action button exists for multi-task quick starts',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await page.locator('button[id="review-roles"]').click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');
        await expect(drawer).toBeVisible();

        const taskListItems = drawer.locator(
          '[class*="quick-start-task"] [class*="content--ul"] li'
        );
        const taskCount = await taskListItems.count();

        if (taskCount > 0) {
          const firstTask = taskListItems.first();
          await firstTask.click();

          const sideNoteButton = drawer.locator('[data-testid="qs-drawer-side-note-action"]');
          const nextButton = drawer.locator('[data-testid="qs-drawer-next"]');

          const hasSideNote = await sideNoteButton.isVisible();
          const hasNext = await nextButton.isVisible();

          expect(hasSideNote || hasNext).toBeTruthy();
        }

        await drawer.locator('[class*="drawer__close"]').click();
      }
    );
  });
});
