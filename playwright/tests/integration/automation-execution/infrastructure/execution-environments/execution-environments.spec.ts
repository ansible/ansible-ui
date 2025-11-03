import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { logout } from '@ansible/playwright/commands/logout';
import { login, platformUI } from '@ansible/playwright/commands/login';
import {
  createOrganization,
  deleteOrganization,
  addUserToOrganization,
} from '../../../access-management/organizations/organization-utils';
import { createAwxProject, deleteAwxProject } from '../../projects/project-utils';
import { createUser, deleteUser } from '../../../access-management/users/user-utils';
import { createInventory } from '../inventories/inventory-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/execution-environments' }));
test.afterEach(setupAfter);

test.describe('Execution Environments', () => {
  test.describe('Execution Environments: Create', () => {
    test(
      'can create a new EE associated to a particular org, assert info on details page, then navigate to EE list and delete the EE',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const execEnvName = createE2EName('exec-env');
        const image = 'quay.io/ansible/awx-ee:latest';

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await page.getByText('Create execution environment', { exact: true }).click();

        await page.getByPlaceholder('Enter execution environment').fill(execEnvName);
        await page.getByPlaceholder('Enter image').fill(image);
        await singleSelectByLabel('Organization', organizationName, page);

        await page.getByRole('button', { name: 'Create execution environment' }).click();

        await expect(page.getByRole('heading', { name: execEnvName, exact: true })).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(execEnvName);
        await expect(page.getByTestId('image')).toContainText(image);
        await expect(page.locator('#organization')).toContainText(organizationName);

        await page
          .getByLabel('Breadcrumb')
          .getByRole('link', { name: 'Execution Environments' })
          .click();
        await expect(page.getByRole('heading', { name: 'Execution Environments' })).toBeVisible();

        await clickTableRow({ filterLabel: 'Name', text: execEnvName }, page);
        await clickPageAction('Delete execution environment', page);
        await confirmAndAssertDeletion(page);

        await deleteOrganization(organizationName, page);
      }
    );

    test(
      'can create a new EE associated to a particular org, then visit the EE tab inside the org to view the EE and assert info',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const execEnvName = createE2EName('exec-env');
        const image = 'quay.io/ansible/awx-ee:latest';

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await page.getByText('Create execution environment', { exact: true }).click();

        await page.getByPlaceholder('Enter execution environment').fill(execEnvName);
        await page.getByPlaceholder('Enter image').fill(image);
        await singleSelectByLabel('Organization', organizationName, page);

        await page.getByRole('button', { name: 'Create execution environment' }).click();

        await expect(page.getByRole('heading', { name: execEnvName, exact: true })).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(execEnvName);
        await expect(page.getByTestId('image')).toContainText(image);
        await expect(page.locator('#organization')).toContainText(organizationName);

        await page.locator('#organization').getByRole('link', { name: organizationName }).click();
        await expect(page.getByRole('heading', { name: organizationName })).toBeVisible();

        await page.getByRole('tab', { name: 'Execution Environments' }).click();

        await filterTable({ filterLabel: 'Name', filterValue: execEnvName }, page);
        await expect(page.locator('tbody')).toContainText(execEnvName);

        await page.locator('tbody tr').first().locator('button.toggle-kebab').first().click();
        await page.getByRole('menuitem', { name: 'Delete execution environment' }).click();
        await confirmAndAssertDeletion(page);

        await deleteOrganization(organizationName, page);
      }
    );

    test(
      'can create a new EE associated to a particular org, assign access to a user in that org, and login as that user to assert access to the EE',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const userInfo = await createUser({ password: 'testPassword123!' }, page);
        const execEnvName = createE2EName('exec-env');
        const image = 'quay.io/ansible/awx-ee:latest';

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await page.getByText('Create execution environment', { exact: true }).click();

        await page.getByPlaceholder('Enter execution environment').fill(execEnvName);
        await page.getByPlaceholder('Enter image').fill(image);
        await singleSelectByLabel('Organization', organizationName, page);

        await page.getByRole('button', { name: 'Create execution environment' }).click();

        await expect(page.getByRole('heading', { name: execEnvName, exact: true })).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(execEnvName);
        await expect(page.getByTestId('image')).toContainText(image);
        await expect(page.locator('#organization')).toContainText(organizationName);

        await addUserToOrganization(
          organizationName,
          userInfo.userName,
          { roles: ['Organization Member'] },
          page
        );

        await logout(page);
        await login(page, platformUI, { username: userInfo.userName, password: userInfo.password });

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await clickTableRow({ filterLabel: 'Name', text: execEnvName }, page);

        await expect(page.getByTestId('name')).toContainText(execEnvName);
        await expect(page.getByTestId('image')).toContainText(image);
        await expect(page.locator('#organization')).toContainText(organizationName);

        await page.getByLabel('kebab dropdown toggle').click();
        await expect(
          page.getByRole('menuitem', { name: 'Delete execution environment' })
        ).toHaveAttribute('aria-disabled', 'true');

        await logout(page, { username: userInfo.userName });
        await login(page);

        await deleteUser(userInfo.userName, page);

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await clickTableRow({ filterLabel: 'Name', text: execEnvName }, page);
        await clickPageAction('Delete execution environment', page);
        await confirmAndAssertDeletion(page);

        await deleteOrganization(organizationName, page);
      }
    );
  });

  test.describe('Execution Environments: Edit and Bulk delete', () => {
    test(
      'can edit an EE from the details view and assert edited information on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const execEnvName = createE2EName('exec-env');
        const image = 'executionenvimage';

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await page.getByText('Create execution environment', { exact: true }).click();
        await page.getByPlaceholder('Enter execution environment').fill(execEnvName);
        await page.getByPlaceholder('Enter image').fill(image);
        await singleSelectByLabel('Organization', organizationName, page);
        await page.getByRole('button', { name: 'Create execution environment' }).click();
        await expect(page.getByRole('heading', { name: execEnvName, exact: true })).toBeVisible();

        await clickPageAction('Edit execution environment', page);
        await expect(page.getByRole('heading', { name: `Edit ${execEnvName}` })).toBeVisible();

        await page.getByPlaceholder('Enter execution environment').fill(`${execEnvName}-edited`);
        await page.getByRole('button', { name: 'Save execution environment' }).click();

        await expect(
          page.getByRole('heading', { name: `${execEnvName}-edited`, exact: true })
        ).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(`${execEnvName}-edited`);
        await expect(page.getByTestId('image')).toContainText(image);
        await expect(page.locator('#organization')).toContainText(organizationName);

        await clickPageAction('Delete execution environment', page);
        await confirmAndAssertDeletion(page);
        await deleteOrganization(organizationName, page);
      }
    );

    test(
      'can edit an EE from the list view and assert edited information',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const execEnvName = createE2EName('exec-env');
        const image = 'executionenvimage';

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await page.getByText('Create execution environment', { exact: true }).click();
        await page.getByPlaceholder('Enter execution environment').fill(execEnvName);
        await page.getByPlaceholder('Enter image').fill(image);
        await singleSelectByLabel('Organization', organizationName, page);
        await page.getByRole('button', { name: 'Create execution environment' }).click();
        await expect(page.getByRole('heading', { name: execEnvName, exact: true })).toBeVisible();

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await clickTableRowAction(
          {
            text: execEnvName,
            action: 'Edit execution environment',
            filterLabel: 'Name',
            filterValue: execEnvName,
          },
          page
        );
        await expect(page.getByRole('heading', { name: `Edit ${execEnvName}` })).toBeVisible();

        await page.getByPlaceholder('Enter execution environment').fill(`${execEnvName}-edited`);
        await page.getByRole('button', { name: 'Save execution environment' }).click();

        await expect(
          page.getByRole('heading', { name: `${execEnvName}-edited`, exact: true })
        ).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(`${execEnvName}-edited`);
        await expect(page.getByTestId('image')).toContainText(image);
        await expect(page.locator('#organization')).toContainText(organizationName);

        await clickPageAction('Delete execution environment', page);
        await confirmAndAssertDeletion(page);
        await deleteOrganization(organizationName, page);
      }
    );

    test(
      'can bulk delete multiple EEs from the list view and assert deletion',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const execEnvNames: string[] = [];

        for (let i = 0; i < 3; i++) {
          const execEnvName = createE2EName('exec-env');
          execEnvNames.push(execEnvName);

          await navigateTo(
            page,
            'Automation Execution',
            'Infrastructure',
            'Execution Environments'
          );
          await page.getByText('Create execution environment', { exact: true }).click();
          await page.getByPlaceholder('Enter execution environment').fill(execEnvName);
          await page.getByPlaceholder('Enter image').fill('executionenvimage');
          await singleSelectByLabel('Organization', organizationName, page);
          await page.getByRole('button', { name: 'Create execution environment' }).click();
          await expect(page.getByRole('heading', { name: execEnvName, exact: true })).toBeVisible();
        }

        await bulkDeleteResources(
          {
            resourceType: 'execution environments',
            resourceNames: [execEnvNames[0], execEnvNames[1]],
            navigationPath: ['Automation Execution', 'Infrastructure', 'Execution Environments'],
            filterLabel: 'Name',
          },
          page
        );

        // Wait for the success modal to close after bulk delete
        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Execution Environments' })).toBeVisible();

        await clickTableRow(
          { filterLabel: 'Name', text: execEnvNames[2], clearFilters: true },
          page
        );
        await clickPageAction('Delete execution environment', page);
        await confirmAndAssertDeletion(page);

        await deleteOrganization(organizationName, page);
      }
    );
  });

  test.describe('Execution Environments: Templates View', () => {
    test(
      'can create a new JT using the existing EE, visit the templates tab of the EE to view the JT, delete the JT and then delete the EE',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        const organizationName = await createOrganization(page);
        const projectName = await createAwxProject({ organizationName }, page);
        const inventoryName = await createInventory({ organizationName }, page);
        const execEnvName = createE2EName('exec-env');
        const image = 'quay.io/ansible/awx-ee:latest';

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
        await page.getByText('Create execution environment', { exact: true }).click();
        await page.getByPlaceholder('Enter execution environment').fill(execEnvName);
        await page.getByPlaceholder('Enter image').fill(image);
        await singleSelectByLabel('Organization', organizationName, page);
        await page.getByRole('button', { name: 'Create execution environment' }).click();

        await expect(page.getByRole('heading', { name: execEnvName, exact: true })).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(execEnvName);
        await expect(page.getByTestId('image')).toContainText(image);
        await expect(page.locator('#organization')).toContainText(organizationName);

        const jtName = createE2EName('job-template');
        await navigateTo(page, 'Automation Execution', 'Templates');
        await page.getByText('Create template', { exact: true }).click();
        await page.getByRole('menuitem', { name: 'Create job template' }).click();

        await page.getByPlaceholder('Enter job template name').fill(jtName);
        await page.getByRole('button', { name: 'Inventory' }).click();
        await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryName);
        await page.getByRole('option', { name: inventoryName, exact: true }).click();

        await page.locator('#project-select').click();
        await page.getByRole('option', { name: projectName }).click();
        await page.getByPlaceholder('Add a project, then select a').click();
        await page.getByPlaceholder('Add a project, then select a').fill('hello');
        await page.getByRole('option', { name: 'hello_world.yml' }).click();

        await page.getByLabel('Execution environment').click();
        await page.getByRole('textbox', { name: 'Search input' }).fill(execEnvName);
        await page.getByRole('option', { name: execEnvName, exact: true }).click();

        await page.getByRole('button', { name: 'Create job template' }).click();
        await expect(page.getByRole('heading', { name: jtName })).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(jtName);
        await expect(page.locator('#inventory')).toContainText(inventoryName);
        await expect(page.locator('#execution-environment')).toContainText(execEnvName);

        await page
          .locator('#execution-environment')
          .getByRole('link', { name: execEnvName })
          .click();
        await expect(page.getByRole('heading', { name: execEnvName })).toBeVisible();
        await expect(page.getByTestId('name')).toContainText(execEnvName);
        await expect(page.getByTestId('image')).toContainText(image);

        await page.getByRole('tab', { name: 'Templates' }).click();
        await filterTable({ filterLabel: 'Name', filterValue: jtName }, page);
        await expect(page.locator('tbody')).toContainText(jtName);

        const kebabButton = page.locator('tbody tr').first().locator('button.toggle-kebab').first();
        await kebabButton.click();
        await page.waitForTimeout(500);
        await page.getByRole('menuitem', { name: 'Delete template' }).click({ force: true });
        await confirmAndAssertDeletion(page);

        await page.getByRole('tab', { name: 'Details' }).click();
        await clickPageAction('Delete execution environment', page);
        await confirmAndAssertDeletion(page);

        await deleteAwxProject(projectName, page);
        await deleteOrganization(organizationName, page);
      }
    );
  });
});
