import { Page } from '@playwright/test';
import { clickButtonByLabel } from '../common/clickButton';
import { clickLinkByLabel } from '../common/clickLink';
import { createE2EName } from '../common/createE2EName';
import { enterTextByLabel } from '../common/enterText';
import { expectPageTitleToContain } from '../common/expectPageTitleToContain';
import { navigateTo } from '../common/navigateTo';

/**
 * Create an AWX organization.
 */
export async function createAwxOrganization(
  page: Page,
  options: {
    organizationName?: string;
  } = {}
) {
  // Create a random organization name if one is not provided
  const organizationName = options.organizationName ?? createE2EName();

  // Navigate to the organizations page
  await navigateTo('Access Management', 'Organizations', page);

  // Click the create organization button
  await clickLinkByLabel('Create organization', page);

  // Enter the organization name
  await enterTextByLabel('Name', organizationName, page);

  // Submit the form
  await clickButtonByLabel('Create organization', page);

  // Verify we are on the organization page - which indicates the organization was created
  await expectPageTitleToContain(organizationName, page);

  // Return the organization name
  return organizationName;
}
