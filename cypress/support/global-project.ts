import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';

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

export function createGlobalProject() {
  cy.log('👀<<CHECKING EXISTENCE OF GLOBAL PROJECT>>👀');

  cy.awxRequestGet<AwxItemsResponse<Project>>(`/api/v2/projects?name=${GLOBAL_PROJECT_NAME}&page=1`)
    .its('results')
    .then((projectResults: Project[]) => {
      //if no global project is returned from the API, then:
      if (projectResults.length === 0) {
        //check to see if a global org exists
        cy.log('👀<<CHECKING EXISTENCE OF GLOBAL ORGANIZATION>>👀');
        cy.awxRequestGet<AwxItemsResponse<Organization>>(
          `/api/v2/organizations?name__startswith=Global&page=1`
        )
          .its('results')
          .then((orgResults: Organization[]) => {
            //if no global org or global project exist:
            if (orgResults.length === 0) {
              cy.log('🚨GLOBAL ORG AND GLOBAL PROJECT NOT FOUND🚨.....🚧CREATING BOTH🚧');
              //create the global org
              cy.createAwxOrganization('Global Project Org').then((globalProjectOrg) => {
                cy.log(
                  '🎉GLOBAL ORG CREATED🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.'
                );
                //create the global project
                cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
                  name: GLOBAL_PROJECT_NAME,
                  description: GLOBAL_PROJECT_DESCRIPTION,
                  organization: globalProjectOrg.id,
                  scm_type: 'git',
                  scm_url: GLOBAL_PROJECT_SCM_URL,
                }).then((globalProject: Project) => {
                  cy.log('🕓<<WAITING FOR PROJECT TO SYNC>>🕓');
                  cy.waitForProjectToFinishSyncing(globalProject.id);
                  cy.log(
                    '🎉GLOBAL PROJECT CREATED🎉....ACCESS IT USING this.globalProject IN THE TESTS.'
                  );
                  //return the global org and global project
                  cy.wrap(globalProject).as('globalProject');
                  cy.wrap(globalProjectOrg).as('globalProjectOrg');
                });
              });
            } else if (orgResults.length === 1) {
              //if a global org is found but no global project is found, then:
              cy.log('🎉GLOBAL ORG FOUND🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.');
              cy.wrap(orgResults[0]).then((globalProjectOrg) => {
                cy.log('🚨GLOBAL PROJECT NOT FOUND🚨......🚧CREATING🚧');
                //create a new global project using the found global org
                cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
                  name: GLOBAL_PROJECT_NAME,
                  description: GLOBAL_PROJECT_DESCRIPTION,
                  organization: globalProjectOrg.id,
                  scm_type: 'git',
                  scm_url: GLOBAL_PROJECT_SCM_URL,
                }).then((globalProject: Project) => {
                  cy.log('🕓<<WAITING FOR PROJECT TO SYNC>>🕓');
                  cy.waitForProjectToFinishSyncing(globalProject.id);
                  cy.log(
                    '🎉GLOBAL PROJECT CREATED🎉....ACCESS IT USING this.globalProject IN THE TESTS.'
                  );
                  //return the global org and global project
                  cy.wrap(globalProject).as('globalProject');
                  cy.wrap(globalProjectOrg).as('globalProjectOrg');
                });
              });
            }
          });
      } else {
        //if the API request returns a global project, check to see if there is a global org:
        cy.log('👀<<CHECKING EXISTENCE OF GLOBAL ORGANIZATION>>👀');
        cy.awxRequestGet<AwxItemsResponse<Organization>>(
          `/api/v2/organizations?name__startswith=Global&page=1`
        )
          .its('results')
          .then((orgResults: Organization[]) => {
            //if no global org exists:
            if (orgResults.length === 0) {
              //create a global org
              cy.createAwxOrganization('Global Project Org').then((globalProjectOrg) => {
                cy.log(
                  '🎉GLOBAL ORG CREATED🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.'
                );
                //delete the global project
                cy.awxRequestDelete(`/api/v2/projects/${projectResults[0].id}/`);
                //create a new global project using the global org
                cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
                  name: GLOBAL_PROJECT_NAME,
                  description: GLOBAL_PROJECT_DESCRIPTION,
                  organization: globalProjectOrg.id,
                  scm_type: 'git',
                  scm_url: GLOBAL_PROJECT_SCM_URL,
                }).then((globalProject: Project) => {
                  cy.log('🕓<<WAITING FOR PROJECT TO SYNC>>🕓');
                  cy.waitForProjectToFinishSyncing(globalProject.id);
                  cy.log(
                    '🎉GLOBAL PROJECT CREATED🎉....ACCESS IT USING this.globalProject IN THE TESTS.'
                  );
                  //return the global org and the global project
                  cy.wrap(globalProject).as('globalProject');
                  cy.wrap(globalProjectOrg).as('globalProjectOrg');
                });
              });
            } else if (orgResults.length === 1) {
              //if one global org is returned from the API, get it:
              cy.log('🎉GLOBAL ORG FOUND🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.');
              cy.wrap(orgResults[0])
                .as('globalProjectOrg')
                //get the global project
                .then((globalProjectOrg) => {
                  cy.log(
                    '🎉GLOBAL PROJECT FOUND🎉....ACCESS IT USING this.globalProject IN THE TESTS.',
                    projectResults[0]
                  );
                  //assert properties of the global org and global project
                  expect(orgResults[0].name).to.equal(GLOBAL_ORG_NAME);
                  expect(projectResults[0].name).to.equal(GLOBAL_PROJECT_NAME);
                  expect(projectResults[0].description).to.equal(GLOBAL_PROJECT_DESCRIPTION);
                  expect(projectResults[0].scm_url).to.equal(GLOBAL_PROJECT_SCM_URL);
                  //return the global org and global project
                  cy.wrap(projectResults[0]).as('globalProject');
                  cy.wrap(globalProjectOrg).as('globalProjectOrg');
                });
            }
          });
      }
    });
}

module.exports = {
  createGlobalProject,
};
