//Tests a user's ability to perform certain actions on the Users list in the EDA UI.

import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Users List', () => {
  let roleIDs: { [key: string]: string };
  let editorRoleID: string;
  let _contributorRoleID: string;
  let auditorRoleID: string;
  let viewerRoleID: string;
  let operatorRoleID: string;
  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleIDs = rolesArray.reduce((acc, role) => {
        const { name, id } = role;
        return { ...acc, [name]: id };
      }, {});

      _contributorRoleID = roleIDs.Contributor;
      viewerRoleID = roleIDs.Viewer;
      editorRoleID = roleIDs.Editor;
      auditorRoleID = roleIDs.Auditor;
      operatorRoleID = roleIDs.Operator;
    });
  });

  it('renders the Users list page', () => {
    cy.navigateTo('eda', 'users');
    cy.verifyPageTitle('Users');
  });

  it('renders the Users details page and shows expected information', () => {
    cy.createEdaUser({
      roles: [editorRoleID],
    }).then((edaUser) => {
      cy.navigateTo('eda', 'users');
      cy.setTablePageSize('100');
      cy.clickTableRow(edaUser.username, false);
      cy.contains(edaUser.username).click();
      cy.verifyPageTitle(edaUser.username);
      cy.clickLink(/^Details$/);
      cy.get('dd#username').should('contain', edaUser.username);
      cy.deleteEdaUser(edaUser);
    });
  });

  it('can bulk delete Users from the list', () => {
    cy.createEdaUser({
      roles: [auditorRoleID],
    }).then((auditor) => {
      cy.createEdaUser({
        roles: [viewerRoleID],
      }).then((viewer) => {
        cy.navigateTo('eda', 'users');
        cy.selectTableRow(auditor.username, false);
        cy.selectTableRow(viewer.username, false);
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.intercept('DELETE', edaAPI`/users/${auditor.id.toString()}/`).as('auditor');
        cy.intercept('DELETE', edaAPI`/users/${viewer.id.toString()}/`).as('viewer');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete users');
        cy.wait(['@auditor', '@viewer']).then((activationArr) => {
          expect(activationArr[0]?.response?.statusCode).to.eql(204);
          expect(activationArr[1]?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
      });
    });
  });

  it('deletes a User from kebab menu from the project details page', () => {
    cy.createEdaUser({
      roles: [operatorRoleID],
    }).then((edaUser) => {
      cy.navigateTo('eda', 'users');
      cy.selectTableRow(edaUser.username, false);
      cy.clickToolbarKebabAction('delete-selected-users');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });
});
