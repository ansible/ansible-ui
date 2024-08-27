//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.

describe('EDA Resource Toolbar Functionality', () => {
  it('can visit the dashboard page and assert the data there', () => {
    cy.get('[data-cy="eda-overview"]').contains('Overview');
    cy.verifyPageTitle('Welcome to Event Driven Automation');
  });

  it('can visit the rule audits page and assert the data there', () => {
    cy.get('[data-cy="eda-rule-audits"]').contains('Rule Audit').click();
    cy.verifyPageTitle('Rule Audit');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'Rule audit allows for monitoring and reviewing the execution of defined rules which have been triggered by incoming events.'
    );
  });

  it('can visit the rulebook activations page and assert the data there', () => {
    cy.get('[data-cy="eda-rulebook-activations"]').contains('Rulebook Activations').click();
    cy.verifyPageTitle('Rulebook Activations');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'Rulebook activations manage the configuration and enabling of rulebooks that govern automation logic triggered by events.'
    );
    cy.contains('button', 'Create rulebook activation').should('exist');
  });

  it('can visit the projects page and assert the data there', () => {
    cy.get('[data-cy="eda-projects"]').contains('Projects').click();
    cy.verifyPageTitle('Projects');
    cy.get('[data-cy="app-description"]').should(
      'have.text',
      'A project is a logical collection of rulebooks.'
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
      'A user is someone who has access to Event Driven Automation with associated permissions and credentials.'
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
      'Credentials are utilized by Event Driven Automation for authentication when launching rulebooks.'
    );
    cy.contains('button', 'Create credential').should('exist');
  });
});
