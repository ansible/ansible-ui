import { Page } from '@playwright/test';
import { clickButtonByLabel } from '../common/clickButton';
import { clickLinkByLabel } from '../common/clickLink';
import { createE2EName } from '../common/createE2EName';
import { enterTextByLabel } from '../common/enterText';
import { expectPageTitleToContain } from '../common/expectPageTitleToContain';
import { singleSelectByLabel } from '../common/singleSelectByLabel';

/**
 * Create an AWX project.
 */
export async function createAwxProject(
  options: {
    projectName?: string;
    organizationName: string;
  },
  page: Page
) {
  // Create a random project name if one is not provided
  const projectName = options.projectName ?? createE2EName();

  // Get the organization name
  const organizationName = options.organizationName;

  // Navigate to the projects page
  await clickLinkByLabel('Projects', page);

  // Click the create project button
  await clickLinkByLabel('Create project', page);

  // Enter the project name
  await enterTextByLabel('Name', projectName, page);

  // Select the organization
  await singleSelectByLabel('Organization', organizationName, page);

  // Select the SCM type
  await page.getByLabel('Choose a Source Control Type').click();
  await page.getByRole('option', { name: 'Git' }).click();

  // Enter the SCM URL
  await enterTextByLabel('Source Control URL', 'https://github.com/ansible/ansible-ui', page);

  // Submit the form
  await clickButtonByLabel('Create project', page);

  // Verify we are on the project page - which indicates the project was created
  await expectPageTitleToContain(projectName, page);

  // Return the project name
  return projectName;
}
