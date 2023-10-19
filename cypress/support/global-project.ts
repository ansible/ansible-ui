import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';

const GLOBAL_PROJECT_NAME = 'Global Project for E2E tests';
const GLOBAL_PROJECT_DESCRIPTION = 'Global Read Only Project for E2E tests';
const GLOBAL_PROJECT_SCM_URL = 'https://github.com/ansible/ansible-ui';

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
  cy.awxRequestGet<AwxItemsResponse<Project>>(`/api/v2/projects?name__startswith=Global&page=1`)
  cy.awxRequestGet<AwxItemsResponse<Project>>(`/api/v2/projects?name=${GLOBAL_PROJECT_NAME}&page=1`)
    .its('results')
    .then((results: Project[]) => {
      if (results.length === 0) {
        cy.log('👀<<CHECKING EXISTENCE OF GLOBAL ORGANIZATION>>👀');
        cy.awxRequestGet<AwxItemsResponse<Organization>>(
          `/api/v2/organizations?name__startswith=Global&page=1`
        )
          .its('results')
          .then((orgs: Organization[]) => {
            if (orgs.length === 0) {
              cy.log('🚨GLOBAL ORG AND GLOBAL PROJECT NOT FOUND🚨.....🚧CREATING BOTH🚧');
              cy.createAwxOrganization('Global Project Org').then((newGlobalProjectOrg) => {
                cy.log(
                  '🎉GLOBAL ORG CREATED🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.'
                );
                cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
                  name: GLOBAL_PROJECT_NAME,
                  description: GLOBAL_PROJECT_DESCRIPTION,
                  organization: newGlobalProjectOrg.id,
                  scm_type: 'git',
                  scm_url: GLOBAL_PROJECT_SCM_URL,
                }).then((globalProject: Project) => {
                  cy.log('🕓<<WAITING FOR PROJECT TO SYNC>>🕓');
                  cy.waitForProjectToFinishSyncing(globalProject.id);
                  cy.log(
                    '🎉GLOBAL PROJECT CREATED🎉....ACCESS IT USING this.globalProject IN THE TESTS.'
                  );
                  cy.wrap(newGlobalProjectOrg).as('globalProjectOrg');
                  return cy.wrap(globalProject).as('globalProject');
                });
              });
            } else {
              cy.log('🎉GLOBAL ORG FOUND🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.');
              cy.wrap(orgs[0]).then((foundGlobalProjectOrg) => {
                cy.log('🚨GLOBAL PROJECT NOT FOUND🚨......🚧CREATING🚧');
                cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
                  name: GLOBAL_PROJECT_NAME,
                  description: GLOBAL_PROJECT_DESCRIPTION,
                  organization: foundGlobalProjectOrg.id,
                  scm_type: 'git',
                  scm_url: GLOBAL_PROJECT_SCM_URL,
                }).then((globalProject: Project) => {
                  cy.log('🕓<<WAITING FOR PROJECT TO SYNC>>🕓');
                  cy.waitForProjectToFinishSyncing(globalProject.id);
                  cy.log(
                    '🎉GLOBAL PROJECT CREATED🎉....ACCESS IT USING this.globalProject IN THE TESTS.'
                  );
                  cy.wrap(foundGlobalProjectOrg).as('globalProjectOrg');
                  return cy.wrap(globalProject).as('globalProject');
                });
              });
            }
          });
      } else {
        cy.log('🎉GLOBAL ORG FOUND🎉....ACCESS IT USING this.globalProjectOrg IN THE TESTS.');
        cy.awxRequestGet<AwxItemsResponse<Organization>>(
          `/api/v2/organizations?name__startswith=Global&page=1`
        )
          .its('results')
          .then((orgs: Organization[]) => {
            cy.wrap(orgs[0]).as('globalProjectOrg');
          });
        cy.log(
          '🎉GLOBAL PROJECT FOUND🎉....ACCESS IT USING this.globalProject IN THE TESTS.',
          results[0]
        );
        expect(results[0].name).to.equal(GLOBAL_PROJECT_NAME);
        expect(results[0].description).to.equal(GLOBAL_PROJECT_DESCRIPTION);
        expect(results[0].scm_url).to.equal(GLOBAL_PROJECT_SCM_URL);
        return cy.wrap(results[0]).as('globalProject');
      }
    });
}

module.exports = {
  createGlobalProject,
};
