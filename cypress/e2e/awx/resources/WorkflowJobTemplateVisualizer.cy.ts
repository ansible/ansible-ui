import { randomString } from '../../../../framework/utils/random-string';

describe('Workflow Job templates visualizer', () => {
  before(() => {
    cy.awxLogin();
  });

  it('Should create a workflow job template and then navigate to the visualizer, and then delete workflow job template', () => {
    const jtName = 'E2E ' + randomString(4);
    // Create workflow job template
    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('this is a description');
    cy.get('[data-cy="Submit"]').click();
    // Navigate to the visuzlizer page
    cy.verifyPageTitle(jtName);
    cy.contains('button:not(:disabled):not(:hidden)', 'Save').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Add node').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Cancel').should('be.visible');
    // Clean up - delete workflow job template
    cy.clickPageAction(/^Delete template/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete template/);
    cy.verifyPageTitle('Template');
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
    // Navigate to the visuzlizer page
    cy.verifyPageTitle(jtName);
    cy.contains('button:not(:disabled):not(:hidden)', 'Save').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Add node').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Cancel').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Cancel').click();
    // Clean up - delete workflow job template
    cy.clickPageAction(/^Delete template/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete template/);
    cy.verifyPageTitle('Template');
  });
});
