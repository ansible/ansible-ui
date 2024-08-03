import { Page } from '@playwright/test';
import { clickButtonByLabel } from '../common/clickButton';
import { createE2EName } from '../common/createE2EName';
import { enterTextByLabel } from '../common/enterText';
import { expectPageTitleToContain } from '../common/expectPageTitleToContain';
import { navigateTo } from '../common/navigateTo';
import { singleSelectByLabel } from '../common/singleSelectByLabel';

/**
 * Create an AWX team.
 */
export async function createAwxTeam(
  options: { teamName?: string; organizationName: string },
  page: Page
) {
  // Create a random team name if one is not provided
  const teamName = options.teamName ?? createE2EName();

  // Navigate to the teams page
  await navigateTo('Access Management', 'Teams', page);

  // Click the create team button
  await clickButtonByLabel('Create team', page);

  // Verify we are on the create team page
  await expectPageTitleToContain('Create Team', page);

  // Enter the team name
  await enterTextByLabel('Name', teamName, page);

  // Select the organization
  await singleSelectByLabel('Organization', options.organizationName, page);

  // Submit the form
  await clickButtonByLabel('Create team', page);

  // Verify we are on the team page - which indicates the team was created
  await expectPageTitleToContain(teamName, page);

  // Return the team name
  return teamName;
}
