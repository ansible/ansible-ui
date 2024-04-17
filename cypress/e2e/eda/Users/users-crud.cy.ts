//Tests a user's ability to create, edit, and delete Users in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Users- Create, Edit, Delete', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can create a User, select user type, and assert the information showing on the details page', () => {
    const userInfo = {
      username: `E2EUser${randomString(4)}`,
      FirstName: 'Firstname',
      LastName: 'Lastname',
      Email: 'first.last@redhat.com',
      roles: [
        {
          id: '5399bd06-a228-4d99-b61d-ab857837ff4b',
          name: 'Admin',
        },
      ],
      Password: `${randomString(12)}`,
    };
    cy.navigateTo('eda', 'users');
    cy.contains('h1', 'Users');
    cy.clickButton(/^Create user$/);
    cy.get('[data-cy="username"]').type(userInfo.username);
    cy.get('[data-cy="first-name"]').type(userInfo.FirstName);
    cy.get('[data-cy="last-name"]').type(userInfo.LastName);
    cy.get('[data-cy="email"]').type(userInfo.Email);
    cy.get('[data-cy="password"]').type(userInfo.Password);
    cy.get('[data-cy="confirmpassword"]').type(userInfo.Password);
    cy.intercept('POST', edaAPI`/users/`).as('createUser');
    cy.clickButton(/^Create user$/);
    cy.hasDetail('First name', userInfo.FirstName);
    cy.hasDetail('Last name', userInfo.LastName);
    cy.hasDetail('Email', userInfo.Email);
    cy.hasDetail('Username', userInfo.username);
    cy.hasDetail('User type', 'Normal user');
    cy.wait('@createUser')
      .its('response.body')
      .then((user: EdaUser) => cy.deleteEdaUser(user));
  });

  it('can edit a User', () => {
    cy.createEdaUser().then((edaUser) => {
      cy.navigateTo('eda', 'users');
      cy.get('h1').should('contain', 'Users');
      cy.setTablePageSize('100');
      cy.clickTableRow(edaUser.username, false);
      cy.contains('button#edit-user', 'Edit user').click();
      cy.verifyPageTitle(`Edit ${edaUser.username}`);
      cy.get('[data-cy="username"]').type(`${edaUser.username}edited`);
      cy.get('[data-cy="first-name"]').type('firstname-edited');
      cy.get('[data-cy="last-name"]').type('lastname-edited');
      cy.get('[data-cy="email"]').type('edited@redhat.com');
      cy.get('[data-cy="password"]').type('newpass');
      cy.get('[data-cy="confirmpassword"]').type('newpass');
      cy.singleSelectByDataCy('usertype', 'System administrator');
      cy.clickButton(/^Save user$/);
      cy.hasDetail('Username', `${edaUser.username}edited`);
      cy.hasDetail('First name', 'firstname-edited');
      cy.hasDetail('Last name', 'lastname-edited');
      cy.hasDetail('Email', 'edited@redhat.com');
      cy.hasDetail('User type', 'System administrator');
      cy.navigateTo('eda', 'users');
      cy.deleteEdaUser(edaUser);
    });
  });

  it('can delete a User', () => {
    cy.createEdaUser().then((edaUser) => {
      cy.navigateTo('eda', 'users');
      cy.get('h1').should('contain', 'Users');
      cy.setTablePageSize('100');
      cy.clickTableRow(edaUser.username, false);
      cy.verifyPageTitle(edaUser.username);
      cy.intercept('DELETE', edaAPI`/users/${edaUser.id.toString()}/`).as('deleteUser');
      cy.clickPageAction('delete-user');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete user');
      cy.wait('@deleteUser').then((deleteuser) => {
        expect(deleteuser?.response?.statusCode).to.eql(204);
        cy.verifyPageTitle('Users');
      });
    });
  });
});
