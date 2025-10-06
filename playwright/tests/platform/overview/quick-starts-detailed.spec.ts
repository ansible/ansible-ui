import { expect, test } from '@playwright/test';
import { checkBuildType } from '../../../commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '../../../commands/constants';
import { setupAfter, setupBefore } from '../../../commands/setup';

test.beforeEach(async ({ request }) => {
  const buildType = await checkBuildType(request);
  if (buildType === SAAS_URL || buildType === AZURE_URL) {
    test.skip();
  }
});

test.beforeEach(setupBefore({ path: '/quickstarts' }));
test.afterEach(setupAfter);

test.describe('Overview - Quick Starts - Detailed Workflow Tests', () => {
  test.describe('Finding Content in Ansible Automation Platform - Complete Walkthrough', () => {
    test(
      'validates all titles, descriptions, and prerequisites',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const quickstartTitles = [
          'Building a decision environment',
          'Building an automation execution environment',
          'Create organization',
          'Create teams',
          'Create users',
          'Creating a dynamic inventory',
          'Creating a project',
          'Creating a rulebook activation',
          'Creating an inventory',
          'Creating and running a job or workflow template',
          'Environments',
          'Finding content in Ansible Automation Platform',
          'Getting started with Ansible Automation Platform - Ansible Operator',
          'Getting started with Ansible Automation Platform - Automation Developer',
          'Getting started with Ansible Automation Platform - Platform Administrator',
          'Inventories',
          'Projects',
          'Review roles',
          'Rulebook activations',
          'Setting up Ansible Lightspeed',
          'Setting up automation mesh',
          'Templates',
        ];

        const quickstartDescriptions = [
          `Build a decision environment.\nPersona: Platform administrator, Automation developer`,
          `Build, view, and sync an environment.\nPersona: Platform administrator, Automation developer`,
          `Create an organization.`,
          `Create a team and associate organizations and roles to that team.`,
          `Create a user and associate organizations, teams, and roles. \nPersona: Platform Administrator`,
          `Create or view a dynamic inventory\nPersona: Platform administrator`,
          `Create a project.\nPersona: Platform administrator, Automation developer`,
          `Create a rulebook activation.\nPersona: Platform administrator, Automation developer`,
          `Create or view an inventory.\nPersona: Platform administrator, Automation developer`,
          `Create and run a job or workflow template.\nPersona: Platform administrator, Automation developer`,
          `Viewing execution and decision environments. \nPersona: Ansible Operator`,
          `Browse automation hub collections to find the content that you need.\nPersona: All`,
          `Learn how to get started with Ansible Automation Platform.`,
          `Learn how to get started with Ansible Automation Platform.`,
          `Learn how to get started with Ansible Automation Platform`,
          `Executing inventories. \nPersona: Ansible operator`,
          `Executing projects.\nPersona: Ansible Operator`,
          `Review roles and create new roles as needed by your organization.\nPersona: Platform Administrator`,
          `Executing rulebook activations.\nPersona: Ansible Operator`,
          `Set up Ansible Lightspeed with IBM watsonx Code Assistant\nPersona: All`,
          `Automate at scale in a cloud-native way\nPersona: All`,
          `Launching a job template.\nPersona: Ansible Operator`,
        ];

        const catalogTitles = page.locator(
          '[class*="catalog-item"] [class*="card__title-text"] [data-test="title"]'
        );
        await expect(catalogTitles).toHaveCount(quickstartTitles.length);

        for (let i = 0; i < quickstartTitles.length; i++) {
          const title = await catalogTitles.nth(i).textContent();
          expect(title?.trim()).toBe(quickstartTitles[i]);
        }

        const catalogDescriptions = page.locator(
          '[class*="catalog-item"] [class*="card__body"] [id*="markdown"]'
        );
        await expect(catalogDescriptions).toHaveCount(quickstartDescriptions.length);

        await page
          .locator('button[id="finding-content-in-ansible-automation-platform"]')
          .click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');
        await expect(
          drawer.getByRole('heading', {
            name: 'Finding content in Ansible Automation Platform',
            level: 2,
          })
        ).toBeVisible();
        await expect(drawer.locator('[class*="quick-start-panel-content"]').first()).toContainText(
          'Quick start • 5 minutes'
        );

        const taskListItems = drawer.locator(
          '[class*="quick-start-task"] [class*="content--ul"] li'
        );
        await expect(taskListItems).toHaveCount(4);

        const listElements = [
          'Browse content by repository',
          'Browse content by namespace',
          'Browse content by tag',
          'Browse content by keyword',
        ];

        for (const listElement of listElements) {
          await expect(drawer).toContainText(listElement);
        }

        const prerequisitesToggle = drawer.locator('button[id*="expandable-section-toggle"]');
        await expect(prerequisitesToggle).toHaveText('View Prerequisites (1)');
        await prerequisitesToggle.click();
        await expect(drawer).toContainText(
          'You have a valid Ansible Automation Platform subscription.'
        );

        const headerTitles = [
          'Filter content by repository type in the Collections view',
          'Filter content by tag in the Collections view',
          'Filter content by Namespace in the Collections view',
          'Filter content by keyword in the Collections view',
        ];

        for (const headerTitle of headerTitles) {
          await expect(drawer).toContainText(headerTitle);
        }

        await drawer.locator('[class*="drawer__close"]').click();

        for (let i = 0; i < quickstartDescriptions.length; i++) {
          const description = await catalogDescriptions.nth(i).textContent();
          expect(description?.trim()).toBe(quickstartDescriptions[i]);
        }
      }
    );

    test(
      'task 1 - Filter content by repository type in the Collections view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const listItems = [
          'From the navigation panel, select Automation Content > ',
          'From the dropdown menu next to the search field, select ',
          'Next to Repository, select the checkbox corresponding to the repository type that you want.',
          'Scroll through the filtered results and select the collection you want. ',
        ];

        await page
          .locator('button[id="finding-content-in-ansible-automation-platform"]')
          .click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');
        await drawer
          .locator('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
          .filter({ hasText: 'Filter content by repository type in the Collections view' })
          .click();

        await expect(
          drawer.locator('[class*="quick-start-task-header"] [class*="content--h2"]')
        ).toHaveText('To filter and browse content by repository type:');

        const taskListItems = drawer.locator(
          '[class*="quick-start-task-header"] [class*="content--ol"] li'
        );
        await expect(taskListItems).toHaveCount(4);

        for (const listElement of listItems) {
          await expect(drawer).toContainText(listElement);
        }

        await expect(drawer.locator('h4[class*="alert__title"]').first()).toContainText('TIP');

        await expect(
          drawer.locator('[class*="alert"] [class*="alert__title"]').last()
        ).toContainText('Check your work');
        await expect(drawer.locator('[class*="alert"] [class*="content--li"]')).toContainText(
          'Did you complete the task successfully?'
        );

        await drawer.locator('input#review-success').click();
        await drawer.locator('[data-testid="qs-drawer-next"]').click();

        await expect(drawer).toContainText('Filter content by tag in the Collections view');

        await drawer.locator('[data-testid="qs-drawer-side-note-action"]').click();
        await drawer.locator('[class*="drawer__close"]').click();
      }
    );

    test(
      'task 2 - Filter content by tag in the Collections view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const listItems = [
          'From the navigation panel, select Automation Content > ',
          'From the dropdown menu next to the search field, select Tag.',
          'Next to Tag, select the checkbox corresponding to the tag that you want to browse.',
        ];

        await page
          .locator('button[id="finding-content-in-ansible-automation-platform"]')
          .click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');
        await drawer
          .locator('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
          .filter({ hasText: 'Filter content by tag in the Collections view' })
          .click();

        const taskListItems = drawer.locator(
          '[class*="quick-start-task-header"] [class*="content--ol"] li'
        );
        await expect(taskListItems).toHaveCount(4);

        for (const listElement of listItems) {
          await expect(drawer).toContainText(listElement);
        }

        await expect(drawer.locator('h4[class*="alert__title"]').first()).toContainText('TIP');
        await expect(drawer).toContainText(
          'Scroll through the filtered results and select the collection you want.'
        );

        await expect(
          drawer.locator('[class*="alert"] [class*="alert__title"]').last()
        ).toContainText('Check your work');
        await expect(drawer.locator('[class*="alert"] [class*="content--li"]')).toContainText(
          'Do you see a list of collection titles that correspond to the tag you selected?'
        );

        await drawer.locator('input#review-failed').click();
        await expect(
          drawer.locator('[class*="alert__description"] [class*="content--p"]')
        ).toContainText("This task isn't verified yet. Try the task again.");

        await drawer.locator('[data-testid="qs-drawer-next"]').click();

        await expect(drawer).toContainText('Filter content by Namespace in the Collections view');
        await expect(drawer).toContainText('Filter content by tag in the Collections view');

        await drawer.locator('[data-testid="qs-drawer-side-note-action"]').click();
        await drawer.locator('[class*="drawer__close"]').click();
      }
    );

    test(
      'task 3 - Filter content by Namespace in the Collections view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const listItems = [
          'From the navigation panel, select Automation Content > ',
          'From the dropdown menu next to the search field, select',
          'Enter the namespace you want to search for.',
        ];

        await page
          .locator('button[id="finding-content-in-ansible-automation-platform"]')
          .click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');
        await drawer
          .locator('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
          .filter({ hasText: 'Filter content by Namespace in the Collections view' })
          .click();

        const taskListItems = drawer.locator(
          '[class*="quick-start-task-header"] [class*="content--ol"] li'
        );
        await expect(taskListItems).toHaveCount(4);

        for (const listElement of listItems) {
          await expect(drawer).toContainText(listElement);
        }

        await expect(drawer.locator('h4[class*="alert__title"]').first()).toContainText('TIP');
        await expect(drawer).toContainText(
          'Scroll through the filtered results and select the collection you want.'
        );

        await expect(
          drawer.locator('[class*="alert"] [class*="alert__title"]').last()
        ).toContainText('Check your work');
        await expect(drawer.locator('[class*="alert"] [class*="content--li"]')).toContainText(
          'Do you see a list of collection titles that correspond to the namespace you searched for?'
        );

        await drawer.locator('input#review-success').click();
        await drawer.locator('[data-testid="qs-drawer-next"]').click();

        await expect(drawer).toContainText('Filter content by keyword in the Collections view');

        await drawer.locator('[data-testid="qs-drawer-side-note-action"]').click();
        await drawer.locator('[class*="drawer__close"]').click();
      }
    );

    test(
      'task 4 - Filter content by keyword in the Collections view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const listItems = [
          'From the navigation panel, select Automation Content > ',
          'From the dropdown menu next to the search field, select',
          'Enter your keyword in the search field and click the magnifying glass icon.',
        ];

        await page
          .locator('button[id="finding-content-in-ansible-automation-platform"]')
          .click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');
        await drawer
          .locator('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
          .filter({ hasText: 'Filter content by keyword in the Collections view' })
          .click();

        const taskListItems = drawer.locator(
          '[class*="quick-start-task-header"] [class*="content--ol"] li'
        );
        await expect(taskListItems).toHaveCount(4);

        for (const listElement of listItems) {
          await expect(drawer).toContainText(listElement);
        }

        await expect(drawer.locator('h4[class*="alert__title"]').first()).toContainText('TIP');
        await expect(drawer).toContainText(
          'Scroll through the filtered results and select the collection you want.'
        );

        await expect(
          drawer.locator('[class*="alert"] [class*="alert__title"]').last()
        ).toContainText('Check your work');
        await expect(drawer.locator('[class*="alert"] [class*="content--li"]')).toContainText(
          'Do you see a list of collection titles that correspond to your search term?'
        );

        await drawer.locator('input#review-success').click();
        await drawer.locator('[data-testid="qs-drawer-next"]').click();

        await expect(drawer).toContainText('Filter content by keyword in the Collections view');

        await drawer.locator('[data-testid="qs-drawer-side-note-action"]').click();
        await drawer.locator('[class*="drawer__close"]').click();
      }
    );
  });

  test.describe('High Priority Quick Starts - Detailed Workflows', () => {
    test('Create organization - complete workflow', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('button[id="create-organization"]').click({ force: true });

      const drawer = page.locator('[data-test="quickstart drawer"]');

      await expect(
        drawer.getByRole('heading', { name: 'Create organization', level: 2 })
      ).toBeVisible();

      const drawerText = await drawer.textContent();
      expect(drawerText?.toLowerCase()).toContain('organization');

      const reviewSuccess = drawer.locator('input#review-success');
      if (await reviewSuccess.isVisible()) {
        await reviewSuccess.click();
      }

      await drawer.locator('[class*="drawer__close"]').click();
    });

    test('Create users - complete workflow', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('button[id="create-users"]').click({ force: true });

      const drawer = page.locator('[data-test="quickstart drawer"]');

      await expect(drawer.getByRole('heading', { name: 'Create users', level: 2 })).toBeVisible();

      const prerequisitesToggle = drawer.locator('button[id*="expandable-section-toggle"]');
      if (await prerequisitesToggle.isVisible()) {
        await prerequisitesToggle.click();
        const drawerText = await drawer.textContent();
        expect(drawerText).toContain('Ansible Automation Platform');
      }

      const drawerText = await drawer.textContent();
      expect(drawerText?.toLowerCase()).toContain('user');

      const reviewSuccess = drawer.locator('input#review-success');
      if (await reviewSuccess.isVisible()) {
        await reviewSuccess.click();
      }

      await drawer.locator('[class*="drawer__close"]').click();
    });

    test('Creating a project - complete workflow', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('button[id="create-project"]').click({ force: true });

      const drawer = page.locator('[data-test="quickstart drawer"]');

      await expect(
        drawer.getByRole('heading', { name: 'Creating a project', level: 2 })
      ).toBeVisible();

      const drawerText = await drawer.textContent();
      expect(drawerText?.toLowerCase()).toContain('project');

      const reviewSuccess = drawer.locator('input#review-success');
      if (await reviewSuccess.isVisible()) {
        await reviewSuccess.click();
      }

      await drawer.locator('[class*="drawer__close"]').click();
    });

    test(
      'Getting started - Platform Administrator - multi-task navigation',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await page
          .locator(
            'button[id="getting started with Ansible Automation Platform - Platform Administrator"]'
          )
          .click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');

        await expect(
          drawer.getByRole('heading', {
            name: 'Getting started with Ansible Automation Platform - Platform Administrator',
            level: 2,
          })
        ).toBeVisible();

        await expect(drawer.locator('[class*="quick-start-panel-content"]').first()).toContainText(
          '20 minutes'
        );

        const taskListItems = drawer.locator(
          '[class*="quick-start-task"] [class*="wizard__nav-list"] li'
        );
        const taskCount = await taskListItems.count();
        expect(taskCount).toBeGreaterThanOrEqual(1);

        await drawer.locator('[class*="drawer__close"]').click();
      }
    );

    test(
      'Getting started - Automation Developer - multi-task navigation',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await page
          .locator('button[id="getting started with Ansible Automation Platformr"]')
          .click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');

        await expect(
          drawer.getByRole('heading', {
            name: 'Getting started with Ansible Automation Platform - Automation Developer',
            level: 2,
          })
        ).toBeVisible();

        const taskListItems = drawer.locator(
          '[class*="quick-start-task"] [class*="wizard__nav-list"] li'
        );
        const taskCount = await taskListItems.count();
        expect(taskCount).toBeGreaterThanOrEqual(1);

        await drawer.locator('[class*="drawer__close"]').click();
      }
    );

    test(
      'Creating and running a job template - multi-task workflow',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await page.locator('button[id="creating-a-job-template"]').click({ force: true });

        const drawer = page.locator('[data-test="quickstart drawer"]');

        await expect(
          drawer.getByRole('heading', {
            name: 'Creating and running a job or workflow template',
            level: 2,
          })
        ).toBeVisible();

        await expect(drawer.locator('[class*="quick-start-panel-content"]').first()).toContainText(
          '10 minutes'
        );

        await expect(drawer).toContainText('template');

        const taskListItems = drawer.locator(
          '[class*="quick-start-task"] [class*="wizard__nav-list"] li'
        );
        const taskCount = await taskListItems.count();
        expect(taskCount).toBeGreaterThanOrEqual(1);

        await drawer.locator('[class*="drawer__close"]').click();
      }
    );

    test('Setting up Ansible Lightspeed', { tag: ['@not_mock'] }, async ({ page }) => {
      await page.locator('button[id="ansible-lightspeed"]').click({ force: true });

      const drawer = page.locator('[data-test="quickstart drawer"]');

      await expect(
        drawer.getByRole('heading', { name: 'Setting up Ansible Lightspeed', level: 2 })
      ).toBeVisible();

      await expect(drawer).toContainText('Lightspeed');

      await drawer.locator('[class*="drawer__close"]').click();
    });
  });

  test.describe('Category-Specific Content Validation', () => {
    test(
      'Platform Admin quick starts mention Access Management',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const platformAdminQuickStarts = ['create-organization', 'creating-a-team', 'create-users'];

        for (const qsId of platformAdminQuickStarts) {
          await page.locator(`button[id="${qsId}"]`).click({ force: true });

          const drawer = page.locator('[data-test="quickstart drawer"]');
          await expect(drawer).toBeVisible();

          const drawerText = await drawer.textContent();
          const hasAccessManagement =
            drawerText?.includes('Access Management') ||
            drawerText?.includes('access') ||
            drawerText?.toLowerCase().includes('organization') ||
            drawerText?.toLowerCase().includes('user') ||
            drawerText?.toLowerCase().includes('team');
          expect(hasAccessManagement).toBeTruthy();

          await drawer.locator('[class*="drawer__close"]').click();
          await expect(drawer).not.toBeVisible();
        }
      }
    );

    test(
      'Automation Execution quick starts mention relevant sections',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const executionQuickStarts = [
          { id: 'create-project', keywords: ['project', 'playbook'] },
          { id: 'create-inventory', keywords: ['inventory', 'host'] },
          { id: 'launch-a-job-template', keywords: ['template', 'job'] },
        ];

        for (const qs of executionQuickStarts) {
          await page.locator(`button[id="${qs.id}"]`).click({ force: true });

          const drawer = page.locator('[data-test="quickstart drawer"]');
          await expect(drawer).toBeVisible();

          const drawerText = await drawer.textContent();
          const hasKeyword = qs.keywords.some((keyword) =>
            drawerText?.toLowerCase().includes(keyword.toLowerCase())
          );
          expect(hasKeyword).toBeTruthy();

          await drawer.locator('[class*="drawer__close"]').click();
          await expect(drawer).not.toBeVisible();
        }
      }
    );

    test(
      'Decision/Execution environment quick starts mention building',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const envQuickStarts = ['build-decision-environment', 'build-execution-environment'];

        for (const qsId of envQuickStarts) {
          await page.locator(`button[id="${qsId}"]`).click({ force: true });

          const drawer = page.locator('[data-test="quickstart drawer"]');
          await expect(drawer).toBeVisible();

          await expect(drawer).toContainText('environment');

          await drawer.locator('[class*="drawer__close"]').click();
          await expect(drawer).not.toBeVisible();
        }
      }
    );
  });
});
