import { randomString } from '../../../../framework/utils/random-string';

describe('Workflow Job templates visualizer', () => {
  before(() => {
    cy.awxLogin();
  });

  it('Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel', () => {
    const jtName = 'E2E ' + randomString(4);
    // Create workflow job template
    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('this is a description');
    cy.get('[data-cy="Submit"]').click();

    cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
    cy.get('h4.pf-v5-c-empty-state__title-text').should(
      'have.text',
      'There are currently no nodes in this workflow'
    );
    cy.get('div.pf-v5-c-empty-state__actions').within(() => {
      cy.get('[data-cy="add-node-button"]').should('be.visible');
    });

    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();

    // Clean up - delete workflow job template
    cy.clickPageAction(/^Delete template/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete template/);
    cy.verifyPageTitle('Template');
  });
});
