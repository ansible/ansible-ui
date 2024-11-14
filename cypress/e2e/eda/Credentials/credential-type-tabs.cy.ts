//Tests a user's ability to create, edit, and delete a Credential in the EDA UI.
//Do we want to add create tests for all credential types now or wait until next release cycle?
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Settings } from '@ansible/awx-ui/interfaces/Settings';
import { EdaCredential, EdaCredentialCreate } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaCredentialType } from '@ansible/eda-ui/interfaces/EdaCredentialType';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { SAAS_URL } from '../../../support/constants';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('If SaaS Build', () => {
  before(function () {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      const saasBaseUrl = data.TOWER_URL_BASE;
      const parseSaas = saasBaseUrl.split('.').slice(2).join('.').toString();
      if (parseSaas === SAAS_URL) {
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
      cy.selectTableRow(cred.name);
      cy.clickToolbarKebabAction('delete-credentials');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete credentials');
      cy.clickButton(/^Close$/);
      cy.get(`${cred.name}`).should('not.exist');
    });
  });
});
