//Tests a user's ability to perform certain actions on the Roles list in the EDA UI.

describe('EDA Roles List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    cy.navigateTo('eda', 'roles');
    cy.hasTitle(/^Roles$/)
      .next('p')
      .should(
        'have.text',
        'A role is a set of permissions that can be assigned to users based on their role within an organization.'
      );
    cy.get('tbody').find('tr').should('have.length', 6);

    cy.hasTitle(/^Roles$/);
    cy.clickLink(/^Editor$/);
    cy.hasTitle(/^Editor$/);
    cy.get('#description').should('contain', 'Has create and edit permissions.');
    cy.clickLink(/^Roles$/);

    cy.hasTitle(/^Roles$/);
    cy.clickLink(/^Viewer$/);
    cy.hasTitle(/^Viewer$/);
    cy.get('#description').should('contain', 'Has read permissions, except users and roles.');
    cy.clickLink(/^Roles$/);

    cy.hasTitle(/^Roles$/);
    cy.clickLink(/^Operator$/);
    cy.hasTitle(/^Operator$/);
    cy.get('#description').should(
      'contain',
      'Has read permissions. Has permissions to enable and disable rulebook activations.'
    );
    cy.clickLink(/^Roles$/);

    cy.hasTitle(/^Roles$/);
    cy.clickLink(/^Auditor$/);
    cy.hasTitle(/^Auditor$/);
    cy.get('#description').should('contain', 'Has all read permissions.');
    cy.clickLink(/^Roles$/);

    cy.hasTitle(/^Roles$/);
    cy.clickLink(/^Admin$/);
    cy.hasTitle(/^Admin$/);
    cy.get('#description').should('contain', 'Has all permissions');
    cy.clickLink(/^Roles$/);

    cy.hasTitle(/^Roles$/);
    cy.clickLink(/^Contributor$/);
    cy.hasTitle(/^Contributor$/);
    cy.get('#description').should(
      'contain',
      'Has create and update permissions with an exception of users and roles. Has enable and disable rulebook activation permissions.'
    );
    cy.clickLink(/^Roles$/);
  });
});
