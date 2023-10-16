import { Project } from '../../../../frontend/awx/interfaces/Project';
let Project: Project;

describe('credentials', () => {
  before(() => {
    cy.awxLogin();
  });

  it('can create a global project', () => {
    cy.get('@globalProject').then((globalProject) => {
      cy.log('WOOHOO', globalProject);
      cy.navigateTo('awx', 'projects');
      cy.searchAndDisplayResource(globalProject.name);
      cy.verifyPageTitle('Projects');
    });
  });
});
