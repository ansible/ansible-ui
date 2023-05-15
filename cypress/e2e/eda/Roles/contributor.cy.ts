import { EdaRole } from '../../../../frontend/eda/interfaces/EdaRole';

describe('Contributor EDA Role - Resource types and permissions', () => {
  let roleIDs: string[];
  let resourceAndActionsArray: EdaRole[];
  let contributorRoleID: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleIDs = rolesArray.map((role) => role.id);
      contributorRoleID = roleIDs[3];
      cy.getEdaRolePermissions(contributorRoleID).then((result) => {
        resourceAndActionsArray = result;
      });
    });
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    const contributorResourceTypes = [
      'Project',
      'Inventory',
      'Extra Vars',
      'Playbook',
      'Rulebook',
      'Decision environment',
      'Credential',
    ];
    const contributorActions = ['create', 'read', 'update', 'delete'];
    cy.navigateTo(/^Roles$/);
    cy.clickLink(/^Contributor$/);
    cy.contains('dd#name', 'Contributor').should('be.visible');
    cy.contains(
      'dd#description',
      'Has create and update permissions with an exception of users and roles. Has enable and disable rulebook activation permissions'
    ).should('be.visible');

    cy.get('dd#permissions').within(() => {
      contributorResourceTypes.forEach((resource) => {
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
    cy.checkResourceNameAndAction(contributorResourceTypes, contributorActions[0]);
    cy.checkResourceNameAndAction(contributorResourceTypes, contributorActions[1]);
    cy.checkResourceNameAndAction(contributorResourceTypes, contributorActions[2]);
    cy.checkResourceNameAndAction(contributorResourceTypes, contributorActions[3]);
  });
});
