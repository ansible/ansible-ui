import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Projects', () => {
  let organization: Organization;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can create a project and then delete it from the project details page', () => {
    const projectName = 'E2E Project ' + randomString(4);
    cy.navigateTo('awx', 'projects');
    cy.verifyPageTitle('Projects');
    cy.clickLink(/^Create project$/);
    cy.get('[data-cy="name"]').type(projectName);
    cy.singleSelectByDataCy('organization', `${organization.name}`);
    cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
    cy.get('[data-cy="scm-url"]').type('https://github.com/ansible/ansible-ui');
    cy.get('[data-cy="option-allow-override"]').click();
    cy.intercept('POST', awxAPI`/projects/`).as('newProject');
    cy.clickButton(/^Create project$/);
    cy.wait('@newProject')
      .its('response.body')
      .then((project: Project) => {
        cy.verifyPageTitle(project.name);
        cy.hasDetail(/^Organization$/, `${organization.name}`);
        cy.hasDetail(/^Source control type$/, 'Git');
        cy.hasDetail(/^Enabled options$/, 'Allow branch override');
        cy.waitForProjectToFinishSyncing(project.id).then((syncedProject) => {
          cy.contains('[data-cy="last-job-status"]', 'Success');
          cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
        });
      });
  });
});
