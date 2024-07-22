import { Page } from '@playwright/test';
import { clickConfirm } from '../common/clickConfirm';
import { clickPageAction } from '../common/clickPageAction';
import { clickSubmit } from '../common/clickSubmit';
import { clickTableRow } from '../common/clickTableRow';
import { expectPageTitleToContain } from '../common/expectPageTitleToContain';
import { clearTableFilters, filterTable } from '../common/filterTable';

export async function deleteAwxProject(projectName: string, page: Page) {
  // Navigate to projects
  await page.click('#awx-projects');
  await expectPageTitleToContain('Projects', page);

  // Filter the table to only show the project
  await clearTableFilters(page);
  await filterTable(projectName, page);

  // Click the project
  await clickTableRow(projectName, page);

  // Verify we are on the project page
  await expectPageTitleToContain(projectName, page);

  // Click the delete action
  await clickPageAction('Delete project', page);

  // Confirm the delete
  await clickConfirm(page);

  // Submit the delete
  await clickSubmit(page);

  // Verify we are back on the projects page - which indicates the project was deleted
  await expectPageTitleToContain('Projects', page);
}
