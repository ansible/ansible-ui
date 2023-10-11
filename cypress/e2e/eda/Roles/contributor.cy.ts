describe('Contributor EDA Role - Resource types and permissions', () => {
  let resourceAndActionsArray: number;
  let contributorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      const contributorRole = rolesArray
        ? rolesArray.find((role) => role.name === 'Contributor')
        : undefined;
      contributorRoleID = contributorRole ? contributorRole.id : '';
      cy.getEdaRolePermissions(contributorRoleID).then((result) => {
        resourceAndActionsArray = result.length;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const contributorResourceTypes = [
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
      'Credential',
    ];
    const contributor_ResourceTypes = [
      'Project',
      'Inventory',
      'Extra Vars',
      'Rulebook',
      'Decision environment',
      'Credential',
    ];
    const contributorActions = ['create', 'read', 'update', 'delete'];
    cy.navigateTo('eda', 'roles');
    cy.clickLink(/^Contributor$/);
    cy.contains('h1', 'Contributor').should('be.visible');
    cy.contains('dd#name', 'Contributor').should('be.visible');
    cy.contains(
      'dd#description',
      'Has create and update permissions with an exception of users and roles. Has enable and disable rulebook activation permissions'
    ).should('be.visible');

    cy.get('dd#permissions').within(() => {
      contributorResourceTypes.forEach((resource) => {
        cy.contains('dt span.pf-v5-c-description-list__text', resource);
      });
      cy.get('.pf-v5-c-description-list__group').should(
        'have.length',
        `${resourceAndActionsArray}`
      );
    });
    cy.checkActionsofResource('Activation').within(() => {
      cy.contains(contributorActions[0]);
      cy.contains(contributorActions[1]);
      cy.contains(contributorActions[2]);
      cy.contains(contributorActions[3]);
      cy.contains('enable');
      cy.contains('2 more').click();
      cy.contains('restart');
    });

    cy.checkActionsofResource('Activation Instance').within(() => {
      cy.contains(contributorActions[1]);
      cy.contains(contributorActions[3]);
    });
    cy.checkActionsofResource('Audit Rule').within(() => {
      cy.contains(contributorActions[1]);
    });
    cy.checkActionsofResource('Audit Event').within(() => {
      cy.contains(contributorActions[1]);
    });
    cy.checkActionsofResource('Task').within(() => {
      cy.contains(contributorActions[1]);
    });
    cy.checkResourceNameAndAction(contributor_ResourceTypes, contributorActions);
  });
});
