import { EdaRole } from '../../../../frontend/eda/interfaces/EdaRole';

describe('Operator EDA Role - Resource types and permissions', () => {
  let roleIDs: string[];
  let resourceAndActionsArray: EdaRole[];
  let operatorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleIDs = rolesArray.map((role) => role.id);
      operatorRoleID = roleIDs[4];
      cy.getEdaRolePermissions(operatorRoleID).then((result) => {
        resourceAndActionsArray = result;
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
      'Playbook',
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
      'Playbook',
      'Rulebook',
      'Decision environment',
      'Credential',
    ];
    const operatorActions = ['read'];
    cy.navigateTo(/^Roles$/);
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
      cy.get('dt span.pf-c-description-list__text').should(
        'have.length',
        `${resourceAndActionsArray.length}`
      );
      cy.get('dd.pf-c-description-list__description').should(
        'have.length',
        `${resourceAndActionsArray.length}`
      );
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
