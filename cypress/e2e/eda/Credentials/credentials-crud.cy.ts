//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '../../../../framework/utils/random-string';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], function () {
  describe('EDA Credentials- Create, Edit, Delete', () => {
    it('can create a container registry credential, and assert the information showing on the details page', () => {
      const name = 'E2E Credential ' + randomString(4);
      cy.navigateTo('eda', 'credentials');
      cy.get('h1').should('contain', 'Credentials');
      cy.clickButton(/^Create credential$/);
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="description"]').type('This is a container registry credential.');
      cy.selectDropdownOptionByResourceName('credential-type-id', 'Container Registry');
      cy.get('[data-cy="inputs-username"]').type('admin');
      cy.get('[data-cy="inputs-password"]').type('testtoken');
      cy.clickButton(/^Create credential$/);
      cy.hasDetail('Name', name);
      cy.hasDetail('Description', 'This is a container registry credential.');
      cy.hasDetail('Credential type', 'Container Registry');
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
      cy.navigateTo('eda', 'credentials');
      cy.get('h1').should('contain', 'Credentials');
      cy.clickButton(/^Create credential$/);
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="description"]').type('This is a GitHub Credential.');
      cy.selectDropdownOptionByResourceName('credential-type-id', 'Source Control');
      cy.get('[data-cy="inputs-password"]').type('testtoken');
      cy.get('[data-cy="inputs-username"]').type('admin');
      cy.clickButton(/^Create credential$/);
      cy.hasDetail('Name', name);
      cy.hasDetail('Description', 'This is a GitHub Credential.');
      cy.hasDetail('Credential type', 'Source Control');
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
        cy.navigateTo('eda', 'credentials');
        cy.get('h1').should('contain', 'Credentials');
        cy.clickTableRow(edaCredential.name);
        cy.clickButton(/^Edit credential$/);
        cy.verifyPageTitle(`Edit ${edaCredential.name}`);
        cy.get('[data-cy="name"]')
          .clear()
          .type(edaCredential.name + 'lalala');
        cy.get('[data-cy="description"]').clear().type('this credential type has been changed');
        cy.clickButton(/^Save credential$/);
        cy.hasDetail('Name', edaCredential.name + 'lalala');
        cy.hasDetail('Description', 'this credential type has been changed');
        cy.navigateTo('eda', 'credentials');
        cy.deleteEdaCredential(edaCredential);
      });
    });

    it('can delete a credential', () => {
      cy.createEdaCredential().then((edaCredential) => {
        cy.navigateTo('eda', 'credentials');
        cy.get('h1').should('contain', 'Credentials');
        cy.clickTableRow(edaCredential.name);
        cy.intercept('DELETE', edaAPI`/eda-credentials/${edaCredential.id.toString()}/`).as(
          'deleted'
        );
        cy.verifyPageTitle(edaCredential.name);
        cy.clickPageAction('delete-credential');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete credential');
        cy.wait('@deleted').then((deleted) => {
          expect(deleted?.response?.statusCode).to.eql(204);
          cy.verifyPageTitle('Credentials');
        });
      });
    });

    it('get warning while deleting a credential already in use', () => {
      cy.createEdaCredential().then((edaCredential) => {
        cy.requestPost<EdaProject>(edaAPI`/projects/`, {
          name: 'E2E Project ' + randomString(4),
          url: 'https://github.com/ansible/ansible-ui',
          eda_credential_id: edaCredential.id,
        }).then((project) => {
          cy.navigateTo('eda', 'credentials');
          cy.get('h1').should('contain', 'Credentials');
          cy.clickTableRow(edaCredential.name);
          cy.intercept(
            'DELETE',
            edaAPI`/eda-credentials/${edaCredential.id.toString()}/?force=true`
          ).as('deleted');
          cy.verifyPageTitle(edaCredential.name);
          cy.clickPageAction('delete-credential');
          cy.clickModalConfirmCheckbox();
          cy.get('.pf-v5-c-alert__title').contains(
            `The following credentials are in use: ${edaCredential.name}`
          );
          cy.clickModalButton('Delete credential');
          cy.wait('@deleted').then((deleted) => {
            expect(deleted?.response?.statusCode).to.eql(204);
            cy.verifyPageTitle('Credentials');
          });
          cy.deleteEdaProject(project);
        });
      });
    });
  });
});
