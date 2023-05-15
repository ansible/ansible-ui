import { EdaRole } from '../../../../frontend/eda/interfaces/EdaRole';

describe('Admin EDA Role - Resource types and permissions', () => {
  let roleIDs: string[];
  let resourceAndActionsArray: EdaRole[];
  let adminRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleIDs = rolesArray.map((role) => role.id);
      adminRoleID = roleIDs[0];
      cy.getEdaRolePermissions(adminRoleID).then((result) => {
        resourceAndActionsArray = result;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const adminResourceTypes = [
      'User',
      'Project',
      'Inventory',
      'Extra Vars',
      'Playbook',
      'Role',
      'Rulebook',
      'Decision environment',
      'Credential',
    ];
    const adminActions = ['create', 'read', 'update', 'delete', 'enable', 'disable', 'restart'];
    cy.navigateTo(/^Roles$/);
    cy.clickLink(/^Admin$/);
    cy.contains('h1', 'Admin').should('be.visible');
    cy.contains('dd#name', 'Admin').should('be.visible');
    cy.contains('dd#description', 'Has all permissions').should('be.visible');
    cy.get('dd#permissions').within(() => {
      adminResourceTypes.forEach((resource) => {
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

    cy.checkActionsofResource('Activation').within(() => {
      cy.contains(adminActions[0]);
      cy.contains(adminActions[1]);
      cy.contains(adminActions[2]);
      cy.contains(adminActions[3]);
      cy.contains('enable');
      cy.contains('2 more').click();
      cy.contains('disable');
      cy.contains('restart');
    });
    cy.checkActionsofResource('Activation Instance').within(() => {
      cy.contains(adminActions[1]);
      cy.contains(adminActions[3]);
    });
    cy.checkActionsofResource('Audit Event').within(() => {
      cy.contains(adminActions[1]);
    });
    cy.checkActionsofResource('Task').within(() => {
      cy.contains(adminActions[1]);
    });
    cy.checkActionsofResource('Audit Rule').within(() => {
      cy.contains(adminActions[1]);
    });

    cy.checkResourceNameAndAction(adminResourceTypes, adminActions[0]);
    cy.checkResourceNameAndAction(adminResourceTypes, adminActions[1]);
    cy.checkResourceNameAndAction(adminResourceTypes, adminActions[2]);
    cy.checkResourceNameAndAction(adminResourceTypes, adminActions[3]);
  });
});
