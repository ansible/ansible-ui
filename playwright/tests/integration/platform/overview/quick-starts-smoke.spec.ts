import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '@ansible/playwright/commands/constants';
import { platformUI } from '@ansible/playwright/commands/login';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';

test.afterEach(setupAfter);

// Quick starts are not available on SaaS/Azure deployments
test.describe('Overview - Quick Starts - Smoke Tests', () => {
  // Skip entire describe block if SaaS/Azure (checked once)
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await setupBefore()({ page });
    const buildType = await checkBuildType(page);
    await page.close();

    if (buildType === SAAS_URL || buildType === AZURE_URL) {
      test.skip(true, 'Quick starts not available on SaaS/Azure deployments');
    }
  });

  // Login and navigate for each test (only runs if not skipped)
  test.beforeEach(async ({ page }) => {
    await setupBefore()({ page });
    await page.goto(`${platformUI}/quickstarts`);
    await page.locator('[class*="catalog-item"]').first().waitFor({ timeout: 30000 });
  });

  interface QuickStartInfo {
    id: string;
    title: string;
    duration: number;
    category:
      | 'Platform Admin'
      | 'Automation Developer'
      | 'Automation Operator'
      | 'Content'
      | 'Platform';
    hasPrerequisites?: boolean;
    isMultiTask?: boolean;
  }

  const allQuickStarts: QuickStartInfo[] = [
    {
      id: 'create-organization',
      title: 'Create organization',
      duration: 5,
      category: 'Platform Admin',
    },
    {
      id: 'creating-a-team',
      title: 'Create teams',
      duration: 10,
      category: 'Platform Admin',
      hasPrerequisites: true,
    },
    {
      id: 'create-users',
      title: 'Create users',
      duration: 5,
      category: 'Platform Admin',
      hasPrerequisites: true,
    },
    {
      id: 'review-roles',
      title: 'Review roles',
      duration: 10,
      category: 'Platform Admin',
      isMultiTask: true,
    },
    {
      id: 'getting started with Ansible Automation Platform - Platform Administrator',
      title: 'Getting started with Ansible Automation Platform - Platform Administrator',
      duration: 20,
      category: 'Platform Admin',
      isMultiTask: true,
    },
    {
      id: 'dynamic-inventory',
      title: 'Creating a dynamic inventory',
      duration: 10,
      category: 'Platform Admin',
    },
    { id: 'create-project', title: 'Creating a project', duration: 5, category: 'Platform Admin' },
    {
      id: 'create-inventory',
      title: 'Creating an inventory',
      duration: 10,
      category: 'Platform Admin',
    },
    {
      id: 'getting started with Ansible Automation Platformr',
      title: 'Getting started with Ansible Automation Platform - Automation Developer',
      duration: 15,
      category: 'Automation Developer',
      isMultiTask: true,
    },
    {
      id: 'creating-a-job-template',
      title: 'Creating and running a job or workflow template',
      duration: 10,
      category: 'Automation Developer',
      isMultiTask: true,
    },
    {
      id: 'creating-a-rulebook-activation',
      title: 'Creating a rulebook activation',
      duration: 5,
      category: 'Automation Developer',
    },
    {
      id: 'getting started with Ansible Automation Platform - Ansible Operator',
      title: 'Getting started with Ansible Automation Platform - Ansible Operator',
      duration: 20,
      category: 'Automation Operator',
      isMultiTask: true,
    },
    { id: 'view-environment', title: 'Environments', duration: 5, category: 'Automation Operator' },
    {
      id: 'execute-an-inventory',
      title: 'Inventories',
      duration: 5,
      category: 'Automation Operator',
    },
    { id: 'execute-project', title: 'Projects', duration: 5, category: 'Automation Operator' },
    {
      id: 'viewing-a-rulebook-activation',
      title: 'Rulebook activations',
      duration: 5,
      category: 'Automation Operator',
    },
    {
      id: 'launch-a-job-template',
      title: 'Templates',
      duration: 5,
      category: 'Automation Operator',
    },
    {
      id: 'build-decision-environment',
      title: 'Building a decision environment',
      duration: 5,
      category: 'Content',
    },
    {
      id: 'build-execution-environment',
      title: 'Building an automation execution environment',
      duration: 10,
      category: 'Content',
      isMultiTask: true,
    },
    {
      id: 'ansible-lightspeed',
      title: 'Setting up Ansible Lightspeed',
      duration: 5,
      category: 'Platform',
    },
    {
      id: 'automation-mesh',
      title: 'Setting up automation mesh',
      duration: 5,
      category: 'Platform',
    },
    {
      id: 'finding-content-in-ansible-automation-platform',
      title: 'Finding content in Ansible Automation Platform',
      duration: 5,
      category: 'Content',
      hasPrerequisites: true,
      isMultiTask: true,
    },
  ];

  test.describe('Page Display and Layout', () => {
    test(
      'Quick starts page displays correctly with all expected elements',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Quick Starts' })).toBeVisible();

        await expect(
          page.getByText('Learn Ansible automation with hands-on quickstarts.')
        ).toBeVisible();

        const statusButton = page.getByRole('button', { name: 'Status' });
        await expect(statusButton).toBeVisible();
        await expect(statusButton).toHaveAttribute('aria-expanded', 'false');

        const catalogTitles = page.locator(
          '[class*="catalog-item"] [class*="card__title-text"] [data-test="title"]'
        );

        await expect(catalogTitles.first()).toBeVisible();
        const titleCount = await catalogTitles.count();
        expect(titleCount).toBeGreaterThanOrEqual(22);
      }
    );
  });

  test.describe('Basic Open/Close Validation - All Quick Starts', () => {
    for (const qs of allQuickStarts) {
      test(
        `can open and close "${qs.title}" (${qs.category})`,
        { tag: ['@not_mock'] },
        async ({ page }) => {
          const quickStartButton = page.locator(`button[id="${qs.id}"]`);

          await expect(quickStartButton).toBeVisible({ timeout: 10000 });

          await quickStartButton.click({ force: true });

          const drawer = page.locator('[data-test="quickstart drawer"]');
          await expect(drawer).toBeVisible({ timeout: 10000 });

          await expect(drawer.getByRole('heading', { name: qs.title, level: 2 })).toBeVisible();

          const durationText = drawer.locator('[class*="quick-start-panel-content"]').first();
          await expect(durationText).toContainText(`${qs.duration} minutes`);

          if (qs.hasPrerequisites) {
            const prerequisitesToggle = drawer.locator('button[id*="expandable-section-toggle"]');
            await expect(prerequisitesToggle).toBeVisible();
            await expect(prerequisitesToggle).toContainText('View Prerequisites');
          }

          if (qs.isMultiTask) {
            const taskListItems = drawer.locator(
              '[class*="quick-start-task"] [class*="wizard__nav-list"] li'
            );
            const taskCount = await taskListItems.count();
            expect(taskCount).toBeGreaterThanOrEqual(1);
          }

          await drawer.locator('[class*="drawer__close"]').click();
          await expect(drawer).not.toBeVisible();
        }
      );
    }
  });
});
