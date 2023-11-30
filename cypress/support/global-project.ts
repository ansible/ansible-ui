import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { awxAPI } from './formatApiPathForAwx';

const GLOBAL_PROJECT_NAME = 'Global Project for E2E tests';
const GLOBAL_PROJECT_DESCRIPTION = 'Global Read Only Project for E2E tests';
const GLOBAL_PROJECT_SCM_URL = 'https://github.com/ansible/ansible-ui';
const GLOBAL_ORG_NAME = 'Global Project Org';

/**
 * Check if the Global Project exists in controller.
 * Return it if it exists; create it if it doesn't.
 *
 * @returns {Promise<void>} The promise resolves when the project is created
 * or already exists, and it's saved as a global alias in Cypress that can be
 * accessed in the tests using this.globalProject.
 *
 * Example usage:
 * To filter by the name of the global project:
 * cy.searchAndDisplayResource(`${(this.globalProject as Project).name}`);
 *
 * Note: Project component must be imported in the spec file where global project is utilized.
 * import { Project } from '../../../../frontend/awx/interfaces/Project';
 *
 * The above code is TypeScript compliant.
 */

export let globalOrganization: Organization;

export function createGlobalOrganization() {
  cy.log('👀<<CHECKING EXISTENCE OF GLOBAL ORGANIZATION>>👀');
  cy.awxRequestGet<AwxItemsResponse<Organization>>(awxAPI`/organizations?name=${GLOBAL_ORG_NAME}`)
    .its('results')
    .then((orgResults: Organization[]) => {
      if (orgResults.length === 0) {
        cy.log('🚨GLOBAL ORG NOT FOUND🚨.....🚧CREATING🚧');
        cy.createAwxOrganization('Global Project Org')
          .as('globalProjectOrg')
          .then((org) => {
            globalOrganization = org;
          });
      } else {
        cy.log('🎉GLOBAL ORG FOUND🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.');
        globalOrganization = orgResults[0];
        cy.wrap(orgResults[0]).as('globalProjectOrg');
      }
    });
}

export let globalProject: Project;

export function createGlobalProject() {
  cy.log('👀<<CHECKING EXISTENCE OF GLOBAL PROJECT>>👀');
  cy.awxRequestGet<AwxItemsResponse<Project>>(awxAPI`/projects?name=${GLOBAL_PROJECT_NAME}&page=1`)
    .its('results')
    .then((projectResults: Project[]) => {
      if (projectResults.length === 0) {
        cy.awxRequestPost<Partial<Project>, Project>(awxAPI`/projects/`, {
          name: GLOBAL_PROJECT_NAME,
          description: GLOBAL_PROJECT_DESCRIPTION,
          organization: globalOrganization.id,
          scm_type: 'git',
          scm_url: GLOBAL_PROJECT_SCM_URL,
        }).then((project: Project) => {
          cy.log('🕓<<WAITING FOR PROJECT TO SYNC>>🕓');
          cy.waitForProjectToFinishSyncing(project.id);
          cy.log('🎉GLOBAL PROJECT CREATED🎉....ACCESS IT USING globalProject IN THE TESTS.');
          globalProject = project;
          cy.wrap(project).as('globalProject');
        });
      } else {
        globalProject = projectResults[0];
        cy.log(
          '🎉GLOBAL PROJECT FOUND🎉....ACCESS IT USING globalProject IN THE TESTS.',
          globalProject
        );
        cy.wrap(projectResults[0]).as('globalProject');
      }
    });
}
