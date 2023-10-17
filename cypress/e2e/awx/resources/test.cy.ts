import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('global project', function () {
  before(() => {
    cy.awxLogin();
  });

  it('can create a global project', function () {
    cy.navigateTo('awx', 'projects');
    cy.searchAndDisplayResource(`${(this.globalProject as Project).name}`);
    cy.verifyPageTitle('Projects');
  });
});
