import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

const mockTemplatesResponse = {
  count: 4,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'job_template',
      name: 'Demo Job Template',
      summary_fields: {
        organization: { id: 1, name: 'Default' },
        labels: { count: 1, results: [{ id: 1, name: 'production' }] },
        recent_jobs: [{ id: 101, status: 'successful', finished: '2025-06-01T14:30:00.000000Z' }],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
    {
      id: 2,
      type: 'workflow_job_template',
      name: 'Provision Cloud Infrastructure',
      summary_fields: {
        organization: { id: 1, name: 'Default' },
        labels: { count: 0, results: [] },
        recent_jobs: [{ id: 202, status: 'failed', finished: '2025-05-30T11:00:00.000000Z' }],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
    {
      id: 3,
      type: 'job_template',
      name: 'Patch Linux Hosts',
      summary_fields: {
        organization: { id: 2, name: 'Operations' },
        labels: {
          count: 2,
          results: [
            { id: 2, name: 'security' },
            { id: 3, name: 'linux' },
          ],
        },
        recent_jobs: [],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
    {
      id: 4,
      type: 'job_template',
      name: 'Network Backup',
      summary_fields: {
        organization: { id: 2, name: 'Operations' },
        labels: { count: 0, results: [] },
        recent_jobs: [],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/controller/v2/unified_job_templates/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTemplatesResponse),
    });
  });
  await setupBefore({ path: '/execution/templates' })({ page });
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test.describe('Templates List - Visual Regression', () => {
  test(
    'templates list page has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
      await expect(page.getByText('Demo Job Template')).toBeVisible();

      const mainContent = page.locator('.pf-v6-c-page__main');
      await expect(mainContent).toHaveScreenshot('templates-list-full-page.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        mask: [page.locator('.pf-v6-c-pagination')],
      });
    }
  );

  test(
    'templates list toolbar has no visual regressions',
    { tag: ['@visual', '@not_mock'] },
    async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
      await expect(page.getByText('Demo Job Template')).toBeVisible();

      const toolbar = page.locator('.pf-v6-c-toolbar').first();
      await expect(toolbar).toBeVisible();
      await expect(toolbar).toHaveScreenshot('templates-list-toolbar.png', {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    }
  );
});
