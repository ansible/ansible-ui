import { EdaRole } from '../../../../frontend/eda/interfaces/EdaRole';

describe('Auditor EDA Role - Resource types and permissions', () => {
  let roleIDs: string[];
  let resourceAndActionsArray: EdaRole[];
  let auditorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleIDs = rolesArray.map((role) => role.id);
      auditorRoleID = roleIDs[5];
      cy.getEdaRolePermissions(auditorRoleID).then((result) => {
        resourceAndActionsArray = result;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const auditorResourceTypes = [
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
    cy.navigateTo(/^Roles$/);
    cy.clickLink(/^Auditor$/);
    cy.contains('dd#name', 'Auditor').should('be.visible');
    cy.contains('dd#description', 'Has all read permissions').should('be.visible');
    cy.get('dd#permissions').within(() => {
      auditorResourceTypes.forEach((resource) => {
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
    cy.checkResourceNameAndAction(auditorResourceTypes, 'read');
  });
});
