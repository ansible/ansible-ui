import { EdaRole } from '../../../../frontend/eda/interfaces/EdaRole';

describe('EDA Roles List', () => {
  let roleIDs: string[];
  let resourceAndActionsArray: EdaRole[];
  let editorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleIDs = rolesArray.map((role) => role.id);
      editorRoleID = roleIDs[1];
      cy.getEdaRolePermissions(editorRoleID).then((result) => {
        resourceAndActionsArray = result;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const editorResourceTypes = [
      'Activation',
      'Project',
      'Inventory',
      'Extra Vars',
      'Playbook',
      'Rulebook',
      'Decision environment',
      'Credential',
    ];
    const editorActions = ['create', 'read', 'update', 'delete'];
    cy.navigateTo(/^Roles$/);
    cy.clickLink(/^Editor$/);
    cy.get('dd#permissions').within(() => {
      editorResourceTypes.forEach((resource) => {
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

    cy.checkResourceNameAndAction(editorResourceTypes, editorActions[0]);
    cy.checkResourceNameAndAction(editorResourceTypes, editorActions[1]);
    cy.checkResourceNameAndAction(editorResourceTypes, editorActions[2]);
    cy.checkResourceNameAndAction(editorResourceTypes, editorActions[3]);
  });
});
