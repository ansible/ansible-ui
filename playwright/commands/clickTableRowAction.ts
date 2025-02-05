import test, { Page } from '@playwright/test';
import { clearTableFilters } from './clearTableFilters';
import { selectTableFilter } from './selectTableFilter';
import { filterTableBySelect } from './filterTableBySelect';

export async function clickTableRowAction(
  options: {
    name: string;
    action: string;
    inKebab?: boolean;
    disableFilter?: boolean;
  },
  page: Page
) {
  await clearTableFilters(page);

  const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;

  if (!mockEnabled && !options.disableFilter) {
    await selectTableFilter('Name', page);
    await filterTableBySelect(options.name, page);
  }

  if (options.inKebab) {
    await page.getByLabel('kebab dropdown toggle').click();
    await page.getByRole('menuitem', { name: options.action }).click();
  } else {
    await page.getByRole('row', { name: options.name }).getByLabel(options.action).click();
  }
}
