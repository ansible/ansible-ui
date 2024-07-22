import { Page } from '@playwright/test';
import { expectRowToContain } from '../common/clickTableRow';
import { clearTableFilters, filterTable } from '../common/filterTable';

export async function syncAwxProject(projectName: string, page: Page) {
  // Navigate to projects
  await page.click('#awx-projects');

  // Filter the table to only show the project
  await clearTableFilters(page);
  await filterTable(projectName, page);

  // Verify the project is in a success state
  await expectRowToContain(projectName, 'Success', page, 60 * 1000);
}
