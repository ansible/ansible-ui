describe('Admin EDA Role - Resource types and permissions', () => {
  let resourceAndActionsArray: number;
  let adminRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      const adminRole = rolesArray ? rolesArray.find((role) => role.name === 'Admin') : undefined;
      adminRoleID = adminRole ? adminRole.id : '';
      cy.getEdaRolePermissions(adminRoleID).then((result) => {
        resourceAndActionsArray = result.length;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const adminResourceTypes = [
      'Activation',
      'Activation Instance',
      'Audit Rule',
      'Audit Event',
      'Task',
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
    const admin_ResourceTypes = [
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
    const adminActions = ['create', 'read', 'update', 'delete'];
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
        `${resourceAndActionsArray}`
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
    cy.checkResourceNameAndAction(admin_ResourceTypes, adminActions);
  });
});
