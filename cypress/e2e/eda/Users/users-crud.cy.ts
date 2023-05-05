//Tests a user's ability to create, edit, and delete Users in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Users- Create, Edit, Delete', () => {
  let roleNames: string[];
  let roleIDs: string[];
  let editorRoleID: string;
  let auditorRoleName: string;
  let contributorRoleName: string;

  before(() => {
    cy.edaLogin();
    cy.getEdaRoles().then((rolesArray) => {
      roleNames = rolesArray.map((role) => role.name);
      roleIDs = rolesArray.map((role) => role.id);
      editorRoleID = roleIDs[2];
      auditorRoleName = roleNames[4];
      contributorRoleName = roleNames[0];
    });
  });

  it('can create a User, select role(s) to add the user to, and assert the information showing on the details page', () => {
    const userInfo = {
      username: `E2EUser${randomString(4)}`,
      FirstName: 'Firstname',
      LastName: 'Lastname',
      Email: 'first.last@redhat.com',
      Password: `${randomString(12)}`,
    };
    cy.navigateTo(/^Users$/);
    cy.contains('h1', 'Users');
    cy.clickButton(/^Create user$/);
    cy.typeInputByLabel(/^Username$/, userInfo.username);
    cy.typeInputByLabel(/^First name$/, userInfo.FirstName);
    cy.typeInputByLabel(/^Last name$/, userInfo.LastName);
    cy.typeInputByLabel(/^Email$/, userInfo.Email);
    cy.typeInputByLabel(/^Password$/, userInfo.Password);
    cy.typeInputByLabel(/^Confirm password$/, userInfo.Password);
    cy.selectEdaUserRoleByName(contributorRoleName);
    cy.contains('button', 'Confirm').should('be.enabled').click();
    cy.clickButton(/^Create user$/);
    cy.hasDetail('First name', userInfo.FirstName);
    cy.hasDetail('Last name', userInfo.LastName);
    cy.hasDetail('Email', userInfo.Email);
    cy.hasDetail('Username', userInfo.username);
    cy.getEdaUserByName(userInfo.username).then((username) => {
      cy.wrap(username).should('not.be.undefined');
      if (username) {
        cy.deleteEdaUser(username);
      }
    });
  });

  it('can edit a User including the roles the user belongs to', () => {
    cy.createEdaUser({
      roles: [editorRoleID],
    }).then((edaUser) => {
      cy.navigateTo(/^Users$/);
      cy.get('h1').should('contain', 'Users');
      cy.clickTableRow(edaUser.username);
      cy.contains('button#edit-user', 'Edit user').click();
      cy.hasTitle(`Edit ${edaUser.username}`);
      cy.typeInputByLabel(/^Username$/, `${edaUser.username}edited`);
      cy.typeInputByLabel(/^First name$/, 'firstname-edited');
      cy.typeInputByLabel(/^Last name$/, 'lastname-edited');
      cy.typeInputByLabel(/^Email$/, 'edited@redhat.com');
      cy.typeInputByLabel(/^Password$/, 'newpass');
      cy.typeInputByLabel(/^Confirm password$/, 'newpass');
      cy.selectEdaUserRoleByName(auditorRoleName);
      cy.contains('button', 'Confirm').should('be.enabled').click();
      cy.clickButton(/^Save user$/);
      cy.hasDetail('Username', `${edaUser.username}edited`);
      cy.hasDetail('First name', 'firstname-edited');
      cy.hasDetail('Last name', 'lastname-edited');
      cy.hasDetail('Email', 'edited@redhat.com');
      cy.get('dd[id="role(s)"] span').should('include.text', auditorRoleName).should('be.visible');
      cy.navigateTo(/^Users$/);
      cy.deleteEdaUser(edaUser);
    });
  });

  it('can delete a User', () => {
    cy.createEdaUser({
      roles: [editorRoleID],
    }).then((edaUser) => {
      cy.navigateTo(/^Users$/);
      cy.get('h1').should('contain', 'Users');
      cy.clickTableRow(edaUser.username);
      cy.hasTitle(edaUser.username);
      cy.intercept('DELETE', `/api/eda/v1/users/${edaUser.id}/`).as('deleteUser');
      cy.clickPageAction(/^Delete user$/);
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete user');
      cy.wait('@deleteUser').then((deleteuser) => {
        expect(deleteuser?.response?.statusCode).to.eql(204);
        cy.hasTitle(/^Users$/);
      });
    });
  });

  it('can view and select from the list of available roles in the Users create form', () => {
    const userRoles = ['Admin', 'Viewer', 'Operator', 'Contributor', 'Editor', 'Auditor'];
    cy.navigateTo(/^Users$/);
    cy.contains('h1', 'Users');
    cy.clickButton(/^Create user$/);
    cy.get('button[aria-label="Options menu"]').click();
    userRoles.forEach((role) => {
      cy.contains('a', role)
        .should('be.visible')
        .parents('td[data-label="Name"]')
        .prev()
        .within(() => {
          cy.get('input[type="checkbox"]').click();
        });
    });
  });
});
