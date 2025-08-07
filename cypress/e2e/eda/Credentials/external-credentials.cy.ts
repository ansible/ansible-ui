//Tests external credentials functionality - creation, linking, and testing capabilities
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { EdaCredential, EdaCredentialCreate } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
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

  describe('EDA External Credentials', () => {
    let edaOrg: EdaOrganization;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
      });
    });

    after(() => {
      cy.deleteEdaOrganization(edaOrg);
    });

    describe('External Credentials Creation and Testing', () => {
      it('can create an external credential and test it', () => {
        const name = 'E2E External Credential ' + randomString(4);
        const token = 'test-vault-token-' + randomString(8);
        cy.navigateTo('eda', 'credentials');
        cy.get('h1').should('contain', 'Credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type(name);
        cy.get('[data-cy="description"]').type('This is an external credential for testing.');

        cy.getBy('[data-cy="organization_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.get('table').should('exist');
          cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });

        cy.getBy('[data-cy="credential_type_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.get('table').should('exist');
          cy.getBy('[data-cy="text-input"] input').type('HashiCorp Vault Secret Lookup');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr').first().find('input').click();
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-url"]').should('exist').type('http://external-user.local');
        cy.get('[data-cy="inputs-token"]').should('exist').type(token);

        cy.get('button:contains("Test")').should('be.enabled');

        cy.get('button:contains("Test")').click();

        cy.get('[data-ouia-component-type="PF6/ModalContent"]', { timeout: 10000 }).within(() => {
          cy.get('h1').should('contain', 'Test external credential');
          cy.get('[data-cy="Cancel"]').click();
        });

        cy.clickButton(/^Create credential$/);

        cy.hasDetail('Name', name);
        cy.hasDetail('Description', 'This is an external credential for testing.');
        cy.hasDetail('Credential type', 'HashiCorp Vault Secret Lookup');
        cy.hasDetail('Url', 'http://external-user.local');

        cy.getEdaCredentialByName(name).then((credential) => {
          cy.wrap(credential).should('not.be.undefined');
          if (credential) {
            cy.deleteEdaCredential(credential);
          }
        });
      });
    });

    describe('Credential Linking Functionality', () => {
      let externalCredential: EdaCredential;

      beforeEach(() => {
        cy.getEdaCredentialTypes(1, 100).then((credentialTypesResponse) => {
          const hashiCorpCredentialType = credentialTypesResponse?.results?.find(
            (type) => type.name === 'HashiCorp Vault Secret Lookup'
          );

          cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
            name: 'E2E External Link Source ' + randomString(4),
            organization_id: edaOrg.id,
            credential_type_id: hashiCorpCredentialType?.id,
            description: 'External credential for linking tests',
            inputs: {
              url: 'https://vault.example.com',
              token: 'test-vault-token-' + randomString(8),
              username: 'external-user',
              password: 'external-password',
              default_auth_path: 'approle',
              api_version: 'v1',
            },
          }).then((credential: Partial<EdaCredential>) => {
            externalCredential = credential as EdaCredential;
          });
        });
      });

      afterEach(() => {
        if (externalCredential) {
          cy.deleteEdaCredential(externalCredential);
        }
      });

      it('can link external credential fields to non-external credential', () => {
        const name = 'E2E Linked Credential ' + randomString(4);
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type(name);
        cy.get('[data-cy="description"]').type('Non-external credential with linked fields.');

        cy.getBy('[data-cy="organization_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });

        cy.getBy('[data-cy="credential_type_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type('Container Registry');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-password-form-group"]').within(() => {
          cy.get('[data-cy="secret-management-input"]').should('exist').click();
        });

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('button[data-cy="id"]').click();
        });

        cy.get('input[aria-label="Search input"]').type(externalCredential.name);
        cy.get('ul li').contains(externalCredential.name).click();

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.get(`[data-cy="secret-path"]`).type('test/path');
          cy.get(`[data-cy="secret-key"]`).type('test_key');

          cy.get('button').contains('Test').parent().should('be.enabled');
          cy.get('button').contains('Test').parent().click();
        });

        cy.get('[data-ouia-component-type="PF6/Alert"]', { timeout: 10000 }).should('exist');

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.get('[data-cy="Submit"]').click();
        });

        cy.get('[data-cy="inputs-password"]').should('be.disabled');
        cy.get('[data-cy="inputs-password"]')
          .should('have.attr', 'placeholder')
          .and('contain', 'Value is managed by');

        cy.get('[data-cy="clear-secret-management-input"]').should('exist');

        cy.get('[data-cy="inputs-username"]').type('regular-user');

        cy.clickButton(/^Create credential$/);

        cy.hasDetail('Name', name);
        cy.hasDetail('Username', 'regular-user');
        cy.get('[data-cy="password-*"]').should('contain', 'External:');
        cy.get('[data-cy="password-*"]').should('contain', externalCredential.name);

        cy.getEdaCredentialByName(name).then((credential) => {
          if (credential) {
            cy.deleteEdaCredential(credential);
          }
        });
      });

      it('can clear linked external credential field', () => {
        const name = 'E2E Clear Link Credential ' + randomString(4);
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type(name);
        cy.get('[data-cy="description"]').type('Test clearing linked fields.');

        cy.getBy('[data-cy="organization_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });

        cy.getBy('[data-cy="credential_type_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type('Source Control');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-password-form-group"]').within(() => {
          cy.get('[data-cy="secret-management-input"]').should('exist').click();
        });

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('button[data-cy="id"]').click();
        });

        cy.get('input[aria-label="Search input"]').type(externalCredential.name);
        cy.get('ul li').contains(externalCredential.name).click();

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.get(`[data-cy="secret-path"]`).type('test/path');
          cy.get(`[data-cy="secret-key"]`).type('test_key');

          cy.get('button').contains('Test').parent().should('be.enabled');
          cy.get('button').contains('Test').parent().click();
        });

        cy.get('[data-ouia-component-type="PF6/Alert"]', { timeout: 10000 }).should('exist');

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.get('[data-cy="Submit"]').click();
        });

        cy.get('[data-cy="inputs-password"]').should('be.disabled');
        cy.get('[data-cy="clear-secret-management-input"]').should('exist');

        cy.get('[data-cy="clear-secret-management-input"]').click();

        cy.get('[data-cy="inputs-password"]').should('not.be.disabled');
        cy.get('[data-cy="inputs-password"]').type('manual-password');

        cy.get('[data-cy="inputs-username"]').type('manual-user');

        cy.clickButton(/^Create credential$/);

        cy.hasDetail('Name', name);
        cy.hasDetail('Username', 'manual-user');

        cy.getEdaCredentialByName(name).then((credential) => {
          if (credential) {
            cy.deleteEdaCredential(credential);
          }
        });
      });

      it('can link multiple fields from different external credentials', () => {
        let secondExternalCredential: EdaCredential;
        cy.getEdaCredentialTypes(1, 100).then((credentialTypesResponse) => {
          const hashiCorpCredentialType = credentialTypesResponse?.results?.find(
            (type) => type.name === 'HashiCorp Vault Secret Lookup'
          );

          cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
            name: 'E2E Second External ' + randomString(4),
            organization_id: edaOrg.id,
            credential_type_id: hashiCorpCredentialType?.id,
            description: 'Second external credential for multi-link test',
            inputs: {
              url: 'https://vault2.example.com',
              token: 'second-vault-token-' + randomString(8),
              username: 'second-external-user',
              password: 'second-external-password',
              default_auth_path: 'approle',
              api_version: 'v1',
            },
          }).then((credential: Partial<EdaCredential>) => {
            secondExternalCredential = credential as EdaCredential;

            const name = 'E2E Multi-Link Credential ' + randomString(4);
            cy.navigateTo('eda', 'credentials');
            cy.getByDataCy('create-credential').click();

            cy.get('[data-cy="name"]').type(name);
            cy.get('[data-cy="description"]').type('Credential with multiple external links.');

            cy.getBy('[data-cy="organization_id"]').click();
            cy.clickButton('Browse');
            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
              cy.getBy('button[data-cy="apply-filter"]').click();
              cy.get('tbody tr input').click();
              cy.clickButton('Confirm');
            });

            cy.getBy('[data-cy="credential_type_id"]').click();
            cy.clickButton('Browse');
            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.getBy('[data-cy="text-input"] input').type('Source Control');
              cy.getBy('button[data-cy="apply-filter"]').click();
              cy.get('tbody tr input').click();
              cy.clickButton('Confirm');
            });

            cy.get('[data-cy="inputs-username-form-group"]').within(() => {
              cy.get('[data-cy="secret-management-input"]').click();
            });

            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.getBy('button[data-cy="id"]').click();
            });

            cy.get('input[aria-label="Search input"]').type(externalCredential.name);
            cy.get('ul li').contains(externalCredential.name).click();

            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.get(`[data-cy="secret-path"]`).type('test/path');
              cy.get(`[data-cy="secret-key"]`).type('test_key');

              cy.get('button').contains('Test').parent().should('be.enabled');
              cy.get('button').contains('Test').parent().click();
            });

            cy.get('[data-ouia-component-type="PF6/Alert"]', { timeout: 10000 }).should('exist');

            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.get('[data-cy="Submit"]').click();
            });

            cy.get('[data-cy="inputs-password-form-group"]').within(() => {
              cy.get('[data-cy="secret-management-input"]').click();
            });

            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.getBy('button[data-cy="id"]').click();
            });

            cy.get('input[aria-label="Search input"]').type(secondExternalCredential.name);
            cy.get('ul li').contains(secondExternalCredential.name).click();

            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.get(`[data-cy="secret-path"]`).type('test/path');
              cy.get(`[data-cy="secret-key"]`).type('test_key');

              cy.get('button').contains('Test').parent().should('be.enabled');
              cy.get('button').contains('Test').parent().click();
            });

            cy.get('[data-ouia-component-type="PF6/Alert"]', { timeout: 10000 }).should('exist');

            cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
              cy.get('[data-cy="Submit"]').click();
            });

            cy.get('[data-cy="inputs-username"]').should('be.disabled');
            cy.get('[data-cy="inputs-password"]').should('be.disabled');

            cy.clickButton(/^Create credential$/);

            cy.hasDetail('Name', name);
            cy.get('[data-cy*="username"]').should('contain', 'External:');
            cy.get('[data-cy*="username"]').should('contain', externalCredential.name);
            cy.get('[data-cy*="password"]').should('contain', 'External:');
            cy.get('[data-cy*="password"]').should('contain', secondExternalCredential.name);

            cy.getEdaCredentialByName(name).then((credential) => {
              if (credential) {
                cy.deleteEdaCredential(credential);
              }
            });

            cy.deleteEdaCredential(secondExternalCredential);
          });
        });
      });
    });

    describe('External Credential Error Handling', () => {
      it('shows appropriate error when external credential test fails', () => {
        const name = 'E2E Failing External Credential ' + randomString(4);
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type(name);
        cy.get('[data-cy="description"]').type('External credential with invalid credentials.');

        cy.getBy('[data-cy="organization_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });

        cy.getBy('[data-cy="credential_type_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type('HashiCorp Vault Secret Lookup');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr').first().find('input').click();
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-url"]').type('https://invalid-vault.example.com');
        cy.get('[data-cy="inputs-token"]').type('invalid-token');

        cy.get('button').contains('Test').parent().click();

        cy.get('[data-ouia-component-type="PF6/ModalContent"]', { timeout: 10000 }).within(() => {
          cy.get('h1').should('contain', 'Test external credential');
          cy.get(`[data-cy="secret-path"]`).type('test/path');
          cy.get(`[data-cy="secret-key"]`).type('test_key');
          cy.get(`[data-cy="Submit"]`).click();
        });

        cy.get('[data-ouia-component-type="PF6/Alert"]', { timeout: 10000 }).within(() => {
          cy.contains('Bad Request').should('exist');
        });

        cy.get('[data-ouia-component-type="PF6/ModalContent"]', { timeout: 10000 }).within(() => {
          cy.get('[data-cy="Cancel"]').click();
        });

        cy.clickButton(/^Create credential$/);
        cy.hasDetail('Name', name);

        cy.getEdaCredentialByName(name).then((credential) => {
          if (credential) {
            cy.deleteEdaCredential(credential);
          }
        });
      });

      it('prevents linking when external credential is not available', () => {
        const name = 'E2E No Link Credential ' + randomString(4);
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type(name);

        cy.getBy('[data-cy="organization_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });

        cy.getBy('[data-cy="credential_type_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type('Container Registry');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });
        cy.get('[data-cy="inputs-password-form-group"]').within(() => {
          cy.get('[data-cy="secret-management-input"]').click();
        });

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('button[data-cy="id"]').click();
        });

        cy.getBy('input[aria-label="Search input"]').type('Not a credential type');
        cy.get('[id="id-select"]').should('contain', 'No results found');

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('button[data-cy="id"]').click();
          cy.clickButton('Cancel');
        });

        cy.get('[data-cy="inputs-password-form-group"]').should('not.be.disabled');
        cy.get('[data-cy="inputs-password-form-group"]').type('manual-password');
        cy.get('[data-cy="inputs-password-form-group"]').type('manual-user');

        cy.clickButton(/^Create credential$/);
        cy.hasDetail('Name', name);

        cy.getEdaCredentialByName(name).then((credential) => {
          if (credential) {
            cy.deleteEdaCredential(credential);
          }
        });
      });
    });
  });
});
