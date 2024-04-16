//Tests a user's ability to perform certain actions on the Navigation toolbar in the EDA UI.

describe('EDA Navigation Bar Functionality', () => {
  before(() => {
    cy.platformLogin();
  });

  it('can visit the dashboard page and assert the data there', () => {
    cy.get('[data-cy="platform-overview"]').contains('Overview');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
  });

  it('can visit the rule audits page and assert the data there', () => {
    cy.get('[data-cy="eda-rule-audits"]').contains('Rule Audit').click();
    cy.verifyPageTitle('Rule Audit');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'Rule audit allows auditing of rules which have been triggered by incoming events.'
    );
  });

  it('can visit the rulebook activations page and assert the data there', () => {
    cy.get('[data-cy="eda-rulebook-activations"]').contains('Rulebook Activations').click();
    cy.verifyPageTitle('Rulebook Activations');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'Rulebook activations are rulebooks that have been activated to run.'
    );
    cy.contains('button', 'Create rulebook activation').should('exist');
  });

  it('can visit the projects page and assert the data there', () => {
    cy.get('[data-cy="eda-projects"]').contains('Projects').click();
    cy.verifyPageTitle('Projects');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'Projects are a logical collection of rulebooks.'
    );
    cy.contains('button', 'Create project').should('exist');
  });

  it('can visit the decision environment page and assert the data there', () => {
    cy.get('[data-cy="eda-decision-environments"]').contains('Decision Environments').click();
    cy.verifyPageTitle('Decision Environments');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'Decision environments are a container image to run Ansible rulebooks.'
    );
    cy.contains('button', 'Create decision environment').should('exist');
  });
});
