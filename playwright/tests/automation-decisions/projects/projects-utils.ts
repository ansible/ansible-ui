import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';
import { singleSelectByLabel } from '../../../commands/singleSelectByLabel';

export async function createEdaProject(
  options: { projectName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Automation Decisions', 'Projects');
  await page.getByText('Create project').click();
  const projectName = options.projectName ?? createE2EName('project');
  await page.getByLabel('Name').fill(projectName);
  const organizationName = options.organizationName;
  await singleSelectByLabel('Organization', organizationName ?? 'Default', page);
  await page.getByLabel('Source Control URL').fill('https://github.com/ansible/ansible-ui');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();
  return projectName;
}

export async function deleteEdaProject(projectName: string, page: Page) {
  await navigateTo(page, 'Automation Decisions', 'Projects');
  await clickTableRow(
    {
      text: projectName,
      pageTitle: 'Projects',
      filterLabel: 'Name',
      filterValue: projectName,
      clearFilters: true,
    },
    page
  );
  await clickPageAction('Delete project', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(page.locator('[data-ouia-component-type="PF5/ModalContent"]')).toContainText(
    'Success'
  );
}
