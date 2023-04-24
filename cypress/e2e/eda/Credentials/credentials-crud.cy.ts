//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Credentials- Create, Edit, Delete', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can create a container registry credential, and assert the information showing on the details page', () => {
    const name = 'E2E Credential ' + randomString(4);
    cy.navigateTo(/^Credentials$/);
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.typeInputByLabel(/^Name$/, name);
    cy.typeInputByLabel(/^Description$/, 'This is a container registry credential.');
    cy.selectDropdownOptionByLabel(/^Type$/, 'Container registry');
    cy.typeInputByLabel(/^User name$/, 'admin');
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

  it('can create a GitHub token credential, and assert the information showing on the details page', () => {
    const name = 'E2E Credential ' + randomString(4);
    cy.navigateTo(/^Credentials$/);
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.typeInputByLabel(/^Name$/, name);
    cy.typeInputByLabel(/^Description$/, 'This is a GitHub Credential.');
    cy.selectDropdownOptionByLabel(/^Type$/, 'GitHub personal access token');
    cy.typeInputByLabel(/^User name$/, 'admin');
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

  it('can create a GitLab token credential, and assert the information showing on the details page', () => {
    const name = 'E2E Credential ' + randomString(4);
    cy.navigateTo(/^Credentials$/);
    cy.get('h1').should('contain', 'Credentials');
    cy.clickButton(/^Create credential$/);
    cy.typeInputByLabel(/^Name$/, name);
    cy.typeInputByLabel(/^Description$/, 'This is a GitLab Credential.');
    cy.selectDropdownOptionByLabel(/^Type$/, 'GitLab personal access token');
    cy.typeInputByLabel(/^User name$/, 'admin');
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

  it('can edit a credential', () => {
    cy.createEdaCredential().then((edaCredential) => {
      cy.navigateTo(/^Credentials$/);
      cy.get('h1').should('contain', 'Credentials');
      cy.clickTableRow(edaCredential.name);
      cy.clickPageAction(/^Edit credential$/);
      cy.hasTitle(/^Edit Credential$/);
      cy.typeInputByLabel(/^Name$/, edaCredential.name + 'lalala');
      cy.typeInputByLabel(/^Description$/, 'this credential type has been changed');
      cy.selectDropdownOptionByLabel(/^Type$/, 'GitHub personal access token');
      cy.typeInputByLabel(/^User name$/, 'velveeta');
      cy.clickButton(/^Save credential$/);
      cy.hasDetail('Name', edaCredential.name + 'lalala');
      cy.hasDetail('Description', 'this credential type has been changed');
      cy.hasDetail('Credential type', 'GitHub personal access token');
      cy.hasDetail('Username', 'velveeta');
      cy.navigateTo(/^Credentials$/);
      cy.deleteEdaCredential(edaCredential);
    });
  });

  it('can delete a credential', () => {
    cy.createEdaCredential().then((edaCredential) => {
      cy.navigateTo(/^Credentials$/);
      cy.get('h1').should('contain', 'Credentials');
      cy.clickTableRow(edaCredential.name);
      cy.hasTitle(edaCredential.name);
      cy.intercept('DELETE', `/api/eda/v1/credentials/${edaCredential.id}/`).as('deleted');
      cy.clickPageAction(/^Delete credential$/);
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credential');
      cy.wait('@deleted').then((deleted) => {
        expect(deleted?.response?.statusCode).to.eql(204);
        cy.hasTitle(/^Credentials$/);
      });
    });
  });
});
