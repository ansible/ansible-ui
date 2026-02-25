import { expect, test } from '@playwright/test';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { EdaProject, Organization } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/decisions/projects' }));
test.afterEach(setupAfter);

test.describe('EDA Projects CRUD', () => {
  let organization: PlatformOrganization;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
  });

  test.afterEach(async ({ page }) => {
    await Organization.api.delete(page, organization.id);
  });

  test(
    'can edit a project from the project details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const edaProject = await EdaProject.api.create(page, {
        organization: organization.id,
      });

      try {
        await test.step('Navigate to project details page', async () => {
          await navigateTo(page, 'Automation Decisions', 'Projects');
          await clickTableRow(
            {
              text: edaProject.name,
              filterLabel: 'Name',
              filterValue: edaProject.name,
              clearFilters: true,
            },
            page
          );
          await expect(
            page.getByRole('heading', { name: edaProject.name, exact: true })
          ).toBeVisible();
        });

        await test.step('Click edit project button', async () => {
          await page.getByTestId('edit-project').click();
          await expect(
            page.getByRole('heading', { name: `Edit ${edaProject.name}`, exact: true })
          ).toBeVisible();
        });

        await test.step('Edit project name', async () => {
          const editedName = `${edaProject.name} edited`;
          await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
          await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);
          await page.getByRole('button', { name: 'Save project', exact: true }).click();

          await expect(page.getByTestId('page-title')).toHaveText(editedName);
          await expect(page.getByTestId('name')).toHaveText(editedName);
        });
      } finally {
        await EdaProject.api.delete(page, edaProject.id);
      }
    }
  );

  test(
    'deletes a Project from kebab menu from the project details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const edaProject = await EdaProject.api.create(page, {
        organization: organization.id,
      });
      let projectDeleted = false;

      try {
        await test.step('Navigate to project details page', async () => {
          await navigateTo(page, 'Automation Decisions', 'Projects');
          await clickTableRow(
            {
              text: edaProject.name,
              filterLabel: 'Name',
              filterValue: edaProject.name,
              clearFilters: true,
            },
            page
          );
          await expect(
            page.getByRole('heading', { name: edaProject.name, exact: true })
          ).toBeVisible();
        });

        await test.step('Delete project from page actions', async () => {
          await clickPageAction('Delete project', page);
          await confirmAndAssertDeletion(page);
          await expect(page.getByTestId('page-title')).toHaveText('Projects');
          projectDeleted = true;
        });
      } finally {
        if (!projectDeleted) {
          await EdaProject.api.delete(page, edaProject.id);
        }
      }
    }
  );
});
