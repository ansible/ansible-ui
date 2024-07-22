import { expect, Page } from '@playwright/test';
import { createE2EName } from '../createE2EName';

export async function createAwxProject(
  page: Page,
  options: {
    projectName?: string;
    organizationName: string;
  }
) {
  const projectName = options.projectName ?? createE2EName();
  const organizationName = options.organizationName;

  await page.getByRole('link', { name: 'Projects', exact: true }).click();

  await page.getByRole('link', { name: 'Create project' }).click();

  await page.getByLabel('Name').fill(projectName);

  await page.getByLabel('Organization *').click();
  await page.getByLabel('Search input').fill(organizationName);
  await page.getByRole('option', { name: organizationName }).click();

  await page.getByLabel('Choose a Source Control Type').click();
  await page.getByRole('option', { name: 'Git' }).click();

  await page.getByLabel('Source Control URL').fill('https://github.com/ansible/ansible-ui');

  await page.getByRole('button', { name: 'Create project' }).click();

  await expect(page.locator('.pf-v5-c-title')).toContainText(projectName);

  return projectName;
}

// it('can create a project and then delete it from the project details page', () => {
//   const projectName = 'E2E Project ' + randomString(4);
//   cy.navigateTo('awx', 'projects');
//   cy.verifyPageTitle('Projects');
//   cy.clickLink(/^Create project$/);
//   cy.get('[data-cy="name"]').type(projectName);
//   cy.singleSelectByDataCy('organization', `${organization.name}`);
//   cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
//   cy.get('[data-cy="scm-url"]').type('https://github.com/ansible/ansible-ui');
//   cy.get('[data-cy="option-allow-override"]').click();
//   cy.intercept('POST', awxAPI`/projects/`).as('newProject');
//   cy.clickButton(/^Create project$/);
//   cy.wait('@newProject')
//     .its('response.body')
//     .then((project: Project) => {
//       cy.verifyPageTitle(project.name);
//       cy.hasDetail(/^Organization$/, `${organization.name}`);
//       cy.hasDetail(/^Source control type$/, 'Git');
//       cy.hasDetail(/^Enabled options$/, 'Allow branch override');
//       cy.waitForProjectToFinishSyncing(project.id).then((syncedProject) => {
//         cy.contains('[data-cy="last-job-status"]', 'Success');
//         cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
//       });
//     });
// });
