describe('Operator EDA Role - Resource types and permissions', () => {
  let resourceAndActionsArray: number;
  let operatorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      const operatorRole = rolesArray
        ? rolesArray.find((role) => role.name === 'Operator')
        : undefined;
      operatorRoleID = operatorRole ? operatorRole.id : '';
      cy.getEdaRolePermissions(operatorRoleID).then((result) => {
        resourceAndActionsArray = result.length;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const operatorResourceTypes = [
      'Activation',
      'Activation Instance',
      'Audit Rule',
      'Audit Event',
      'Task',
      'Project',
      'Inventory',
      'Extra Vars',
      'Rulebook',
      'Decision environment',
      'Credential',
    ];
    const operator_ResourceTypes = [
      'Activation Instance',
      'Audit Rule',
      'Audit Event',
      'Task',
      'Project',
      'Inventory',
      'Extra Vars',
      'Rulebook',
      'Decision environment',
      'Credential',
    ];
    const operatorActions = ['read'];
    cy.navigateTo('eda', 'roles');
    cy.clickLink(/^Operator$/);
    cy.contains('h1', 'Operator').should('be.visible');
    cy.contains('dd#name', 'Operator').should('be.visible');
    cy.contains(
      'dd#description',
      'Has read permissions. Has permissions to enable and disable rulebook activations.'
    ).should('be.visible');
    cy.get('dd#permissions').within(() => {
      operatorResourceTypes.forEach((resource) => {
        cy.contains('dt span.pf-c-description-list__text', resource);
      });
      cy.get('.pf-c-description-list__group').should('have.length', `${resourceAndActionsArray}`);
    });
    cy.get('dd#permissions').within(() => {
      cy.contains('dt.pf-c-description-list__term', 'Activation')
        .next()
        .within(() => {
          cy.contains('read');
          cy.contains('enable');
          cy.contains('disable');
          cy.contains('restart');
        });
      cy.checkResourceNameAndAction(operator_ResourceTypes, operatorActions);
    });
  });
});
