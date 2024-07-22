import { Page } from '@playwright/test';
import { clickConfirm } from '../common/clickConfirm';
import { clickPageAction } from '../common/clickPageAction';
import { clickSubmit } from '../common/clickSubmit';
import { clickTableRow } from '../common/clickTableRow';
import { expectPageTitleToContain } from '../common/expectPageTitleToContain';
import { clearTableFilters, filterTable } from '../common/filterTable';
import { navigateTo } from '../common/navigateTo';

export async function deleteAwxTeam(teamName: string, page: Page) {
  // Navigate to teams
  await navigateTo('Access Management', 'Teams', page);

  // Filter the table to only show the team
  await clearTableFilters(page);
  await filterTable(teamName, page);

  // Click the team
  await clickTableRow(teamName, page);

  // Verify we are on the team page
  await expectPageTitleToContain(teamName, page);

  // Click the delete action
  await clickPageAction('Delete team', page);

  // Confirm the delete
  await clickConfirm(page);

  // Submit the delete
  await clickSubmit(page);

  // Verify we are back on the teams page - which indicates the team was deleted
  await expectPageTitleToContain('Teams', page);
}
