import { EdaRole } from '../../../../frontend/eda/interfaces/EdaRole';

describe('Viewer EDA Role - Resource types and permissions', () => {
  let roleIDs: string[];
  let resourceAndActionsArray: EdaRole[];
  let viewerRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleIDs = rolesArray.map((role) => role.id);
      viewerRoleID = roleIDs[2];
      cy.getEdaRolePermissions(viewerRoleID).then((result) => {
        resourceAndActionsArray = result;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const viewerResourceTypes = [
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
    ];
    cy.navigateTo(/^Roles$/);
    cy.clickLink(/^Viewer$/);
    cy.contains('h1', 'Viewer').should('be.visible');
    cy.contains('dd#name', 'Viewer').should('be.visible');
    cy.contains('dd#description', 'Has read permissions, except users and roles.').should(
      'be.visible'
    );
    cy.get('dd#permissions').within(() => {
      viewerResourceTypes.forEach((resource) => {
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
    cy.checkResourceNameAndAction(viewerResourceTypes, 'read');
  });
});
