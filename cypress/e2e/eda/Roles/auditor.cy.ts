describe('Auditor EDA Role - Resource types and permissions', () => {
  let resourceAndActionsArray: number;
  let auditorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      const auditorRole = rolesArray
        ? rolesArray.find((role) => role.name === 'Auditor')
        : undefined;
      auditorRoleID = auditorRole ? auditorRole.id : '';
      cy.getEdaRolePermissions(auditorRoleID).then((result) => {
        resourceAndActionsArray = result.length;
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
    const auditorActions = ['read'];
    cy.navigateTo(/^Roles$/);
    cy.clickLink(/^Auditor$/);
    cy.contains('h1', 'Auditor').should('be.visible');
    cy.contains('dd#name', 'Auditor').should('be.visible');
    cy.contains('dd#description', 'Has all read permissions').should('be.visible');
    cy.get('dd#permissions').within(() => {
      auditorResourceTypes.forEach((resource) => {
        cy.contains('dt span.pf-c-description-list__text', resource);
      });
      cy.get('dt span.pf-c-description-list__text').should(
        'have.length',
        `${resourceAndActionsArray}`
      );
    });
    cy.checkResourceNameAndAction(auditorResourceTypes, auditorActions);
  });
});
