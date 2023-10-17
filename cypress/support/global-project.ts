import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Project } from '../../frontend/awx/interfaces/Project';

const GLOBAL_PROJECT_NAME = 'Global Project for E2E tests';
const GLOBAL_PROJECT_DESCRIPTION = 'Global Read Only Project for E2E tests';
const GLOBAL_PROJECT_SCM_URL = 'https://github.com/ansible/test-playbooks.git';

/**
 *
 * @param {Boolean} checkData if true, check if the global project was not modified by any tests
 * @returns {Promise<Object>} the global project
 */
function checkIfGlobalProjectExists() {
  return cy
    .awxRequestGet<AwxItemsResponse<Project>>(`/api/v2/projects?name__startswith=Global&page=1`)
    .its('results')
    .then((results: Project[]) => {
      if (results.length === 0) {
        // cy.log('ZERO', results);
        return null;
      } else {
        // cy.log('PROJECT IS HERE', results);
        expect(results[0].name).to.equal(GLOBAL_PROJECT_NAME);
        expect(results[0].description).to.equal(GLOBAL_PROJECT_DESCRIPTION);
        expect(results[0].scm_url).to.equal(GLOBAL_PROJECT_SCM_URL);
      }
      return results[0];
    });
}

/**
 * Check if the Global Project exists in controller
 * return it if it exists or create it if it doesn't.
 *
 * @returns {Promise<void>} The promise resolves when the project is created
 * or already exists and it's saved as a global alias in Cypress that can be
 * used in the tests by using this.globalProject.
 */

export function createGlobalProject() {
  cy.log('🔎 Checking if global project exists before creating it');

  checkIfGlobalProjectExists().then((globalProject: Project) => {
    if (globalProject) {
      cy.log(
        '✅ Global project exists, access it via this.globalProject in the tests',
        globalProject
      );
      return cy.wrap(globalProject).as('globalProject');
    } else {
      cy.log('🤷 Global project does not exist, creating it...');
      cy.awxRequestPost<Partial<Project>, Project>('/api/v2/projects/', {
        name: GLOBAL_PROJECT_NAME,
        description: GLOBAL_PROJECT_DESCRIPTION,
        scm_type: 'git',
        scm_url: GLOBAL_PROJECT_SCM_URL,
      }).then((globalProject) => {
        cy.log('✅ Global project created, access it via this.globalProject in the tests');
        return cy.wrap(globalProject).as('globalProject');
      });
    }
  });
}

module.exports = {
  createGlobalProject,
};
