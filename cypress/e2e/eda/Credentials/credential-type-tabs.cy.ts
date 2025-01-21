//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import {
  EdaCredential,
  EdaCredentialCreate,
} from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaCredentialType } from '../../../../frontend/eda/interfaces/EdaCredentialType';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('Check if the build includes EDA', () => {
  before(function () {
    cy.getPlatformApis().then((data) => {
      if (data?.apis && !data?.apis?.eda) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('EDA Credentials Type - Tabs', () => {
    let cred: EdaCredential | EdaCredentialCreate;
    let credtype: EdaCredentialType;
    let edaOrg: EdaOrganization;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.createEdaCredentialType().then((credentialtype) => {
          credtype = credentialtype;
          cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
            name: 'E2E Credential ' + randomString(4),
            organization_id: edaOrg.id,
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
      cy.clickTableRow(credtype.name, true);
      cy.verifyPageTitle(credtype.name);
      cy.clickTab('Credentials', true);
      cy.clickTableRow(cred.name, true);
      cy.contains('h1', cred.name);
    });

    it('can remove credentials via Credentials Tab', () => {
      cy.navigateTo('eda', 'credential-types');
      cy.verifyPageTitle('Credential Types');
      cy.clickTableRow(credtype.name, true);
      cy.clickTab('Credentials', true);
      cy.getTableRowByText(cred.name, false).within(() => {
        cy.get('input[type=checkbox]').click();
      });
      cy.clickToolbarKebabAction('delete-credentials');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credentials');
      cy.get(`${cred.name}`).should('not.exist');
    });
  });
});
