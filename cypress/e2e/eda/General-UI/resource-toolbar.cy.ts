//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.

describe('EDA Resource Toolbar Functionality', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can visit the dashboard page and assert the data there', () => {
    cy.get('[data-cy="eda-overview"]').contains('Overview');
    cy.verifyPageTitle('Welcome to Event Driven Automation');
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

  it('can visit the users page and assert the data there', () => {
    cy.get('[data-cy="eda-users"]').contains('Users').click();
    cy.verifyPageTitle('Users');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'A user is someone who has access to EDA with associated permissions and credentials.'
    );
    cy.contains('button', 'Create user').should('exist');
  });

  it('can visit the roles page and assert the data there', () => {
    cy.get('[data-cy="eda-roles"]').contains('Roles').click();
    cy.verifyPageTitle('Roles');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'A role represents a set of actions that a team or user may perform on a resource or set of resources.'
    );
  });

  it('can visit the credentials page and assert the data there', () => {
    cy.get('[data-cy="eda-credentials"]').contains('Credentials').click();
    cy.verifyPageTitle('Credentials');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'Credentials are utilized by EDA for authentication when launching rulebooks.'
    );
    cy.contains('button', 'Create credential').should('exist');
  });
});
