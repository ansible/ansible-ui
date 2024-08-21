//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '../../../../framework/utils/random-string';
import {
  EdaCredential,
  EdaCredentialCreate,
} from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaCredentialType } from '../../../../frontend/eda/interfaces/EdaCredentialType';
import { cyLabel } from '../../../support/cyLabel';
import { edaAPI } from '../../../support/formatApiPathForEDA';

cyLabel(['aaas-unsupported'], function () {
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

    it('can view credentials in use via Credentials Tab', () => {
      cy.navigateTo('eda', 'credential-types');
      cy.verifyPageTitle('Credential Types');
      cy.clickTableRow(credtype.name, false);
      cy.verifyPageTitle(credtype.name);
      cy.clickTab('Credentials', true);
      cy.clickTableRow(cred.name, false);
      cy.contains('h1', cred.name);
    });

    it('can remove credentials via Credentials Tab', () => {
      cy.navigateTo('eda', 'credential-types');
      cy.verifyPageTitle('Credential Types');
      cy.clickTableRow(credtype.name, false);
      cy.clickTab('Credentials', true);
      cy.selectTableRow(cred.name);
      cy.clickToolbarKebabAction('delete-credentials');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credentials');
      cy.clickButton(/^Close$/);
      cy.get(`${cred.name}`).should('not.exist');
    });
  });
});
