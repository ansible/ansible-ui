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
    const operatorActions = ['enable', 'read', 'disable', 'restart'];
    cy.navigateTo(/^Roles$/);
    cy.clickLink(/^Operator$/);
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
    cy.checkResourceNameAndAction(operatorResourceTypes, 'read');
    cy.get('dd#permissions').within(() => {
      cy.contains('dt.pf-c-description-list__term', 'Activation')
        .next()
        .within(() => {
          operatorActions.forEach((action) => {
            cy.contains(action);
          });
        });
    });
  });
});
