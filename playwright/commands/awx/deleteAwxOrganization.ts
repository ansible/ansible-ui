import { Page } from '@playwright/test';
import { clickConfirm } from '../common/clickConfirm';
import { clickPageAction } from '../common/clickPageAction';
import { clickSubmit } from '../common/clickSubmit';
import { clickTableRow } from '../common/clickTableRow';
import { expectPageTitleToContain } from '../common/expectPageTitleToContain';
import { clearTableFilters, filterTable } from '../common/filterTable';
import { navigateTo } from '../common/navigateTo';

export async function deleteAwxOrganization(organizationName: string, page: Page) {
  // Navigate to organizations
  await navigateTo('Access Management', 'Organizations', page);

  // Filter the table to only show the organization
  await clearTableFilters(page);
  await filterTable(organizationName, page);

  // Click the organization
  await clickTableRow(organizationName, page);

  // Verify we are on the organization page
  await expectPageTitleToContain(organizationName, page);

  // Click the delete action
  await clickPageAction('Delete organization', page);

  // Confirm the delete
  await clickConfirm(page);

  // Submit the delete
  await clickSubmit(page);

  // Verify we are back on the organizations page
  // Which indicates the organization was deleted
  await expectPageTitleToContain('Organizations', page);
}
