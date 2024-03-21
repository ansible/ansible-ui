//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '../../../../framework/utils/random-string';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Credentials- Create, Edit, Delete', () => {
  before(() => {
    cy.edaLogin();
  });

  it.skip('can create a container registry credential, and assert the information showing on the details page', () => {
    const name = 'E2E Credential ' + randomString(4);
    cy.navigateTo('eda', 'credentials');
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a container registry credential.');
    cy.selectDropdownOptionByResourceName('credential-type', 'Container registry');
    cy.get('[data-cy="username"]').type('admin');
    cy.get('[data-cy="secret"]').type('testtoken');
    cy.clickButton(/^Create credential$/);
    cy.hasDetail('Name', name);
    cy.hasDetail('Description', 'This is a container registry credential.');
    cy.hasDetail('Credential type', 'Container registry');
    cy.hasDetail('Username', 'admin');
    cy.getEdaCredentialByName(name).then((credential) => {
      cy.wrap(credential).should('not.be.undefined');
      if (credential) {
        cy.deleteEdaCredential(credential);
      }
    });
  });

  it.skip('can create a GitHub token credential, and assert the information showing on the details page', () => {
    const name = 'E2E Credential ' + randomString(4);
    cy.navigateTo('eda', 'credentials');
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a GitHub Credential.');
    cy.selectDropdownOptionByResourceName('credential-type', 'GitHub personal access token');
    cy.get('[data-cy="secret"]').type('testtoken');
    cy.get('[data-cy="username"]').type('admin');
    cy.clickButton(/^Create credential$/);
    cy.hasDetail('Name', name);
    cy.hasDetail('Description', 'This is a GitHub Credential.');
    cy.hasDetail('Credential type', 'GitHub personal access token');
    cy.hasDetail('Username', 'admin');
    cy.getEdaCredentialByName(name).then((credential) => {
      cy.wrap(credential).should('not.be.undefined');
      if (credential) {
        cy.deleteEdaCredential(credential);
      }
    });
  });

  it.skip('can create a GitLab token credential, and assert the information showing on the details page', () => {
    const name = 'E2E Credential ' + randomString(4);
    cy.navigateTo('eda', 'credentials');
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a GitLab Credential.');
    cy.selectDropdownOptionByResourceName('credential-type', 'GitLab personal access token');
    cy.get('[data-cy="secret"]').type('testtoken');
    cy.get('[data-cy="username"]').type('admin');
    cy.clickButton(/^Create credential$/);
    cy.hasDetail('Name', name);
    cy.hasDetail('Description', 'This is a GitLab Credential.');
    cy.hasDetail('Credential type', 'GitLab personal access token');
    cy.hasDetail('Username', 'admin');
    cy.getEdaCredentialByName(name).then((credential) => {
      cy.wrap(credential).should('not.be.undefined');
      if (credential) {
        cy.deleteEdaCredential(credential);
      }
    });
  });

  it.skip('can edit a credential', () => {
    cy.createEdaCredential().then((edaCredential) => {
      cy.navigateTo('eda', 'credentials');
      cy.get('h1').should('contain', 'Credentials');
      cy.clickTableRow(edaCredential.name);
      cy.clickButton(/^Edit credential$/);
      cy.verifyPageTitle(`Edit ${edaCredential.name}`);
      cy.get('[data-cy="name"]').type(edaCredential.name + 'lalala');
      cy.get('[data-cy="description"]').type('this credential type has been changed');
      cy.get('[data-cy="secret"]').type('testtoken');
      cy.selectDropdownOptionByResourceName('credential-type', 'GitHub personal access token');
      cy.get('[data-cy="username"]').type('velveeta');
      cy.clickButton(/^Save credential$/);
      cy.hasDetail('Name', edaCredential.name + 'lalala');
      cy.hasDetail('Description', 'this credential type has been changed');
      cy.hasDetail('Credential type', 'GitHub personal access token');
      cy.hasDetail('Username', 'velveeta');
      cy.navigateTo('eda', 'credentials');
      cy.deleteEdaCredential(edaCredential);
    });
  });

  it.skip('can delete a credential', () => {
    cy.createEdaCredential().then((edaCredential) => {
      cy.navigateTo('eda', 'credentials');
      cy.get('h1').should('contain', 'Credentials');
      cy.clickTableRow(edaCredential.name);
      cy.verifyPageTitle(edaCredential.name);
      cy.intercept('DELETE', edaAPI`/credentials/${edaCredential.id.toString()}/`).as('deleted');
      cy.clickPageAction('delete-credential');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credential');
      cy.wait('@deleted').then((deleted) => {
        expect(deleted?.response?.statusCode).to.eql(204);
        cy.verifyPageTitle('Credentials');
      });
    });
  });
});
