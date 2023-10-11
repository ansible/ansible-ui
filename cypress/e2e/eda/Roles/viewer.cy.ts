describe('Viewer EDA Role - Resource types and permissions', () => {
  let resourceAndActionsArray: number;
  let viewerRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      const viewerRole = rolesArray ? rolesArray.find((role) => role.name === 'Viewer') : undefined;
      viewerRoleID = viewerRole ? viewerRole.id : '';
      cy.getEdaRolePermissions(viewerRoleID).then((result) => {
        resourceAndActionsArray = result.length;
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
      'Rulebook',
      'Decision environment',
    ];
    const viewerActions = ['read'];
    cy.navigateTo('eda', 'roles');
    cy.clickLink(/^Viewer$/);
    cy.contains('h1', 'Viewer').should('be.visible');
    cy.contains('dd#name', 'Viewer').should('be.visible');
    cy.contains('dd#description', 'Has read permissions, except users and roles.').should(
      'be.visible'
    );
    cy.get('dd#permissions').within(() => {
      viewerResourceTypes.forEach((resource) => {
        cy.contains('dt span.pf-v5-c-description-list__text', resource);
      });
      cy.get('dt span.pf-v5-c-description-list__text').should(
        'have.length',
        `${resourceAndActionsArray}`
      );
    });
    cy.checkResourceNameAndAction(viewerResourceTypes, viewerActions);
  });
});
