describe('Editor EDA Role - Resource types and permissions', () => {
  let resourceAndActionsArray: number;
  let editorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      const editorRole = rolesArray ? rolesArray.find((role) => role.name === 'Editor') : undefined;
      editorRoleID = editorRole ? editorRole.id : '';
      cy.getEdaRolePermissions(editorRoleID).then((result) => {
        resourceAndActionsArray = result.length;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const editorResourceTypes = [
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
    const editor_ResourceTypes = [
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
    cy.contains('h1', 'Editor').should('be.visible');
    cy.contains('dd#name', 'Editor').should('be.visible');
    cy.contains('dd#description', 'Has create and edit permissions').should('be.visible');
    cy.get('dd#permissions').within(() => {
      editorResourceTypes.forEach((resource) => {
        cy.contains('dt span.pf-c-description-list__text', resource);
      });
      cy.get('dt span.pf-c-description-list__text').should(
        'have.length',
        `${resourceAndActionsArray}`
      );
    });
    cy.checkActionsofResource('Activation Instance').within(() => {
      cy.contains(editorActions[1]);
    });
    cy.checkActionsofResource('Audit Event').within(() => {
      cy.contains(editorActions[1]);
    });
    cy.checkActionsofResource('Audit Rule').within(() => {
      cy.contains(editorActions[1]);
    });
    cy.checkActionsofResource('Task').within(() => {
      cy.contains(editorActions[1]);
    });
    cy.checkResourceNameAndAction(editor_ResourceTypes, editorActions);
  });
});
