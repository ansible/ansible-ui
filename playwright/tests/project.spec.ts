import { expect, Page, test } from '@playwright/test';
import { clearTableFilters } from '../commands/clearTableFilters';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { expectRowToContain } from '../commands/expectRowToContain';
import { filterTableBySelect } from '../commands/filterTableBySelect';
import { navigateTo } from '../commands/navigateTo';
import { setupAfter, setupBefore } from '../commands/setup';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

test.beforeEach(setupBefore({ path: '/execution/projects' }));
test.afterEach(setupAfter);

test('project - create, sync, and delete', async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const projectName = await createAwxProject({}, page);
  await syncAwxProject(projectName, page);
  await deleteAwxProject(projectName, page);
});

export async function createAwxProject(
  options: { projectName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Automation Execution', 'Projects');
  await page.getByRole('link', { name: 'Create project', exact: true }).click();
  const projectName = options.projectName ?? createE2EName();
  await page.getByLabel('Name').fill(projectName);
  const organizationName = options.organizationName;
  await singleSelectByLabel('Organization', organizationName ?? 'Default', page);
  await page.getByLabel('Select source control type').click();
  await page.getByRole('option', { name: 'Git' }).click();
  await page.getByLabel('Source Control URL').fill('https://github.com/ansible/ansible-ui');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();
  return projectName;
}

export async function syncAwxProject(projectName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Projects');
  await clearTableFilters(page);
  await filterTableBySelect(projectName, page);
  await expectRowToContain(projectName, 'Success', page, 60 * 1000);
}

export async function deleteAwxProject(projectName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Projects');
  await clearTableFilters(page);
  await filterTableBySelect(projectName, page);
  await clickTableRow(projectName, page);
  await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();
  await clickPageAction('Delete project', page);
  await page.locator('#confirm').click();
  await page.locator('#submit').click();
  await expect(
    page.getByRole('heading', { name: 'Automation Execution Projects', exact: true })
  ).toBeVisible();
}
