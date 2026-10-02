import { expect, test } from '@playwright/test';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { EdaProject, Organization } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/decisions/projects' }));
test.afterEach(setupAfter);

test.describe('EDA Projects - SCM Update on Launch', () => {
  let organization: PlatformOrganization;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
  });

  test.afterEach(async ({ page }) => {
    await Organization.api.delete(page, organization.id);
  });

  test(
    'should create project with scm update on launch enabled',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await test.step('Navigate to create project page', async () => {
        await navigateTo(page, 'Automation Decisions', 'Projects');
        await page.getByText('Create project').click();
        await expect(page.getByRole('heading', { name: 'Create project' })).toBeVisible();
      });

      const projectName = `E2E SCM Update Project ${Date.now()}`;

      await test.step('Fill in basic project information', async () => {
        await page.getByRole('textbox', { name: 'Name', exact: true }).fill(projectName);
        await page
          .getByRole('textbox', { name: 'Description' })
          .fill('Test project for SCM update on launch');
        await page
          .getByRole('textbox', { name: 'Source control URL' })
          .fill('https://github.com/ansible/ansible-rulebook');
        await page.getByRole('button', { name: 'Organization' }).click();
        await page
          .locator('#organization_id-search')
          .getByRole('textbox', { name: 'Search input' })
          .fill(organization.name);
        await page.getByRole('option', { name: organization.name }).click();
      });

      await test.step('Enable SCM update on launch', async () => {
        const scmUpdateCheckbox = page.getByRole('checkbox', { name: 'Update revision on launch' });
        await expect(scmUpdateCheckbox).toBeVisible();
        await expect(scmUpdateCheckbox).not.toBeChecked();
        await scmUpdateCheckbox.check();
        await expect(scmUpdateCheckbox).toBeChecked();
      });

      await test.step('Verify cache timeout field appears and set value', async () => {
        await expect(page.getByText('Option Details')).toBeVisible();
        const cacheTimeoutInput = page.getByRole('spinbutton', { name: 'Cache Timeout' });
        await expect(cacheTimeoutInput).toBeVisible();
        await expect(cacheTimeoutInput).toHaveValue('0');
        await cacheTimeoutInput.fill('300');
        await expect(cacheTimeoutInput).toHaveValue('300');
      });

      await test.step('Save project', async () => {
        await page.getByRole('button', { name: 'Create project' }).click();
        await expect(page.getByRole('heading', { name: projectName })).toBeVisible({
          timeout: 15000,
        });
      });

      let projectId: number | undefined;

      await test.step('Verify project details show SCM update settings', async () => {
        // Wait for project import to complete
        await expect(page.getByText('Completed')).toBeVisible({
          timeout: 30000,
        });

        // Verify enabled options section shows Update revision on launch
        await expect(page.getByText('Update revision on launch')).toBeVisible();

        // Verify cache timeout value is displayed
        await expect(page.getByText('Cache timeout')).toBeVisible();
        await expect(page.getByText('300 seconds')).toBeVisible();

        // Capture project ID from URL for cleanup
        const url = page.url();
        const match = url.match(/\/projects\/(\d+)/);
        if (match) {
          projectId = parseInt(match[1], 10);
        }
      });

      // Cleanup
      if (projectId) {
        await EdaProject.api.delete(page, projectId);
      }
    }
  );

  test(
    'should toggle cache timeout field visibility when checkbox is toggled',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Decisions', 'Projects');
      await page.getByText('Create project').click();

      const scmUpdateCheckbox = page.getByRole('checkbox', { name: 'Update revision on launch' });
      const cacheTimeoutField = page.getByRole('spinbutton', { name: 'Cache Timeout' });

      await test.step('Cache timeout field should not be visible initially', async () => {
        await expect(scmUpdateCheckbox).not.toBeChecked();
        await expect(cacheTimeoutField).not.toBeVisible();
        await expect(page.getByText('Option Details')).not.toBeVisible();
      });

      await test.step('Cache timeout field should appear when checkbox is checked', async () => {
        await scmUpdateCheckbox.check();
        await expect(page.getByText('Option Details')).toBeVisible();
        await expect(cacheTimeoutField).toBeVisible();
      });

      await test.step('Cache timeout field should disappear when checkbox is unchecked', async () => {
        await scmUpdateCheckbox.uncheck();
        await expect(cacheTimeoutField).not.toBeVisible();
        await expect(page.getByText('Option Details')).not.toBeVisible();
      });
    }
  );

  test(
    'should edit project to enable scm update on launch',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const edaProject = await EdaProject.api.create(page, {
        organization: organization.id,
      });

      try {
        await test.step('Navigate to project edit page', async () => {
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
          await clickPageAction('Edit project', page);
          await expect(
            page.getByRole('heading', { name: `Edit ${edaProject.name}` })
          ).toBeVisible();
        });

        await test.step('Enable SCM update on launch and set cache timeout', async () => {
          const scmUpdateCheckbox = page.getByRole('checkbox', {
            name: 'Update revision on launch',
          });
          await expect(scmUpdateCheckbox).not.toBeChecked();
          await scmUpdateCheckbox.check();

          await expect(page.getByText('Option Details')).toBeVisible();
          const cacheTimeoutInput = page.getByRole('spinbutton', { name: 'Cache Timeout' });
          await cacheTimeoutInput.fill('600');
        });

        await test.step('Save project and verify changes', async () => {
          await page.getByRole('button', { name: 'Save project' }).click();
          await expect(page.getByRole('heading', { name: edaProject.name })).toBeVisible();

          await expect(page.getByText('Update revision on launch')).toBeVisible();
          await expect(page.getByText('Cache timeout')).toBeVisible();
          await expect(page.getByText('600 seconds')).toBeVisible();
        });
      } finally {
        // Wait for project sync to complete before deletion to avoid 500 errors
        await EdaProject.api.waitForSync(page, edaProject.id).catch(() => {
          // Ignore sync failures during cleanup
        });
        await EdaProject.api.delete(page, edaProject.id);
      }
    }
  );

  test(
    'should create project with scm update disabled and verify cache timeout is not shown',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const edaProject = await EdaProject.api.create(page, {
        organization: organization.id,
      });

      try {
        await test.step('Navigate to project details', async () => {
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
        });

        await test.step('Verify SCM update option is not shown in enabled options', async () => {
          // When scm_update_on_launch is false, the "Update revision on launch" option should not appear
          await expect(page.getByText('Update revision on launch')).not.toBeVisible();
        });
      } finally {
        // Wait for project sync to complete before deletion to avoid 500 errors
        await EdaProject.api.waitForSync(page, edaProject.id).catch(() => {
          // Ignore sync failures during cleanup
        });
        await EdaProject.api.delete(page, edaProject.id);
      }
    }
  );

  test(
    'should preserve cache timeout value when editing project',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const edaProject = await EdaProject.api.create(page, {
        organization: organization.id,
      });

      try {
        await test.step('Navigate to edit page and enable SCM update', async () => {
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
          await clickPageAction('Edit project', page);

          const scmUpdateCheckbox = page.getByRole('checkbox', {
            name: 'Update revision on launch',
          });
          await scmUpdateCheckbox.check();
          await page.getByRole('spinbutton', { name: 'Cache Timeout' }).fill('120');
          await page.getByRole('button', { name: 'Save project' }).click();
          await expect(page.getByRole('heading', { name: edaProject.name })).toBeVisible();
        });

        await test.step('Edit project again and verify cache timeout is preserved', async () => {
          await clickPageAction('Edit project', page);
          await expect(
            page.getByRole('heading', { name: `Edit ${edaProject.name}` })
          ).toBeVisible();

          const scmUpdateCheckbox = page.getByRole('checkbox', {
            name: 'Update revision on launch',
          });
          await expect(scmUpdateCheckbox).toBeChecked();

          const cacheTimeoutInput = page.getByRole('spinbutton', { name: 'Cache Timeout' });
          await expect(cacheTimeoutInput).toBeVisible();
          await expect(cacheTimeoutInput).toHaveValue('120');
        });
      } finally {
        await EdaProject.api.waitForSync(page, edaProject.id).catch(() => {});
        await EdaProject.api.delete(page, edaProject.id);
      }
    }
  );
});
