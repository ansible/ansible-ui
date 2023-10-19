import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Project } from '../../frontend/awx/interfaces/Project';

const GLOBAL_PROJECT_NAME = 'Global Project for E2E tests';
const GLOBAL_PROJECT_DESCRIPTION = 'Global Read Only Project for E2E tests';
const GLOBAL_PROJECT_SCM_URL = 'https://github.com/ansible/test-playbooks.git';

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
  cy.awxRequestGet<AwxItemsResponse<Project>>(`/api/v2/projects?name=${GLOBAL_PROJECT_NAME}&page=1`)
    .its('results')
    .then((results: Project[]) => {
      if (results.length === 0) {
        cy.log('🤷 Global project does not exist, creating it...');
        cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
          name: GLOBAL_PROJECT_NAME,
          description: GLOBAL_PROJECT_DESCRIPTION,
          scm_type: 'git',
          scm_url: GLOBAL_PROJECT_SCM_URL,
        }).then((globalProject: Project) => {
          cy.waitForProjectToFinishSyncing(globalProject.id);
          cy.log('✅ Global project created, access it via this.globalProject in the tests');
          return cy.wrap(globalProject).as('globalProject');
        });
      } else {
        expect(results[0].name).to.equal(GLOBAL_PROJECT_NAME);
        expect(results[0].description).to.equal(GLOBAL_PROJECT_DESCRIPTION);
        expect(results[0].scm_url).to.equal(GLOBAL_PROJECT_SCM_URL);
        cy.log(
          '✅ Global project exists, access it via this.globalProject in the tests',
          results[0]
        );
        return cy.wrap(results[0]).as('globalProject');
      }
    });
}

module.exports = {
  createGlobalProject,
};
