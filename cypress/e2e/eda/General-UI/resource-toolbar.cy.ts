//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.

describe('EDA Resource Toolbar Functionality', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can visit the dashboard page and assert the data there', () => {
    cy.get('.pf-c-nav__item').contains('Dashboard').click();
    cy.get('h1').should('contain', 'Welcome to EDA Server');
    cy.contains('button', 'Create project').should('exist');
    cy.contains('button', 'Create rulebook activation').should('exist');
  });

  it('can visit the projects page and assert the data there', () => {
    cy.get('.pf-c-nav__item').contains('Projects').click();
    cy.get('h1').should('contain', 'Projects');
    cy.contains('button', 'Create project').should('exist');
  });

  it('can visit the credentials page and assert the data there', () => {
    cy.get('.pf-c-nav__item').contains('Credentials').click();
    cy.get('h1').should('contain', 'Credentials');
    cy.contains('button', 'Create credential').should('exist');
  });

  it('can visit the decision environments page and assert the data there', () => {
    cy.get('.pf-c-nav__item').contains('Decision environments').click();
    cy.get('h1').should('contain', 'Decision environments');
    cy.contains('button', 'Create Decision Environment').should('exist');
  });

  it('can visit the rule audits page and assert the data there', () => {
    cy.get('.pf-c-nav__link').contains('Rule audit').click();
    cy.get('h1').should('contain', 'Rule Audit');
  });

  it('can visit the rulebook activations page and assert the data there', () => {
    cy.get('.pf-c-nav__link').contains('Rulebook activations').click();
    cy.get('h1').should('contain', 'Rulebook activations');
    cy.get('.pf-c-page__main-section').then(($ele) => {
      if ($ele.find('.pf-c-empty-state').length > 0) {
        cy.contains('button', 'Create rulebook activation').should('exist');
      } else if ($ele.find('tbody').length > 0) {
        cy.contains('button', 'Create rulebook activation').should('exist');
      }
    });
  });

  it.skip('can visit the users page and assert the data there', () => {
    // TODO: needs further work when Users page is functional
    cy.get('.pf-c-nav__item').contains('Users').click();
    cy.get('h1').should('contain', 'Users');
    cy.contains('button', 'Create user').should('exist');
  });

  it('can visit the roles page and assert the data there', () => {
    cy.get('.pf-c-nav__item').contains('Roles').click();
    cy.get('h1').should('contain', 'Roles');
  });
});
