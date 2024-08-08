//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '../../../../framework/utils/random-string';
import {
  EdaCredential,
  EdaCredentialCreate,
} from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaCredentialType } from '../../../../frontend/eda/interfaces/EdaCredentialType';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], function () {
  describe('EDA Credentials Type - Tabs', () => {
    let cred: EdaCredential | EdaCredentialCreate;
    let credtype: EdaCredentialType;
    before(() => {
      cy.createEdaCredentialType().then((credentialtype) => {
        credtype = credentialtype;
        cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
          name: 'E2E Credential ' + randomString(4),
          credential_type_id: credtype.id,
          description: 'This is a Credential with custom credential type',
          inputs: {
            username: 'test_username',
          },
        }).then((credential) => {
          cred = credential;
        });
      });
    });

    after(() => {
      cy.deleteEdaCredential(cred as EdaCredential).then(() => {
        cy.deleteEdaCredentialType(credtype);
      });
      cy.deleteEdaCredentialType(credtype);
    });

    it.skip('can view credentials in use via Credentials Tab', () => {
      cy.navigateTo('eda', 'credential-types');
      cy.get('h1').should('contain', 'Credential Types');
      cy.clickTableRow(credtype.name, false);
      cy.verifyPageTitle(credtype.name);
      cy.contains('li', 'Credentials').click();
      cy.clickTableRow(cred.name, false);
      cy.contains('h1', cred.name);
    });

    it.skip('can remove credentials via Credentials Tab', () => {
      cy.navigateTo('eda', 'credential-types');
      cy.get('h1').should('contain', 'Credential Types');
      cy.clickTableRow(credtype.name, false);
      cy.get('[data-ouia-component-type="PF5/Tabs"]').within(() => {
        cy.contains('li', 'Credentials').click();
      });
      cy.getTableRowByText(`${cred.name}`, false).within(() => {
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('[data-cy="delete-credential"]').click();
      });
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credentials');
      cy.clickButton(/^Close$/);
      cy.get(`${cred.name}`).should('not.exist');
    });
  });
});
