//Tests a user's ability to perform certain actions on the Users list in the EDA UI.

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
    cy.navigateTo(/^Users$/);
    cy.hasTitle(/^Users$/)
      .next('p')
      .should(
        'have.text',
        'A user is someone who has access to EDA with associated permissions and credentials.'
      );
  });

  it('renders the Users details page and shows expected information', () => {
    cy.createEdaUser({
      roles: [editorRoleID],
    }).then((edaUser) => {
      cy.visit('/eda/users?sort=&page=1&perPage=100');
      cy.contains(edaUser.username).click();
      cy.hasTitle(edaUser.username);
      cy.clickButton(/^Details$/);
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
        cy.visit('/eda/users?sort=&page=1&perPage=100');
        cy.selectTableRow(auditor.username, false);
        cy.selectTableRow(viewer.username, false);
        cy.clickToolbarKebabAction(/^Delete selected users$/);
        cy.intercept('DELETE', `/api/eda/v1/users/${auditor.id}/`).as('auditor');
        cy.intercept('DELETE', `/api/eda/v1/users/${viewer.id}/`).as('viewer');
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
      cy.visit('/eda/users?sort=&page=1&perPage=100');
      cy.selectTableRow(edaUser.username, false);
      cy.clickToolbarKebabAction(/^Delete selected users$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });

  it.skip('can view the groups that the user is associated with', () => {
    // TODO: Future Scope as per Mock ups
  });
});
