import { EdaCredential } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';

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

  describe('EDA External Credentials Tests', () => {
    let edaOrg: EdaOrganization;
    let externalCredential: EdaCredential;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
      });
    });

    after(() => {
      cy.deleteEdaOrganization(edaOrg);
    });

    describe('External Credential Creation Form', () => {
      it('should show Test button only for external credential types', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();
        cy.get('[data-cy="name"]').type('Test External Type Detection');
        cy.get('[data-cy="description"]').type('Testing external type detection.');
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
        cy.get('button').contains('Test').should('not.exist');
        cy.getBy('[data-cy="credential_type_id"]').click();
        cy.clickButton('Browse');
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').clear().type('AWS');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });
        cy.get('button').contains('Test').should('be.visible');
        cy.get('[data-cy="inputs-aws-access-key"]').type('accessKey');
        cy.get('[data-cy="inputs-aws-secret-key"]').type('awsSecretKey');
        cy.get('button').contains('Test').click();
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.contains('h1', 'Test external credential').should('be.visible');
        });
      });
    });

    describe('Credential Linking', () => {
      beforeEach(() => {
        cy.createEdaExternalCredential(edaOrg.id).then((credential) => {
          externalCredential = credential;
        });
      });

      afterEach(() => {
        if (externalCredential) {
          cy.deleteEdaCredential(externalCredential);
        }
      });

      it('should show secret management buttons for non-external credential fields', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();
        cy.get('[data-cy="name"]').type('Test Link UI Components');
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
        cy.get('[data-cy="inputs-username-form-group"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').should('exist');
          });
        cy.get('[data-cy="inputs-password-form-group"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').should('exist');
          });
        cy.clickButton('Cancel');
      });

      it('should not show secret management buttons for external credential types', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();
        cy.get('[data-cy="name"]').type('Test No Link Buttons External');
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
          cy.getBy('[data-cy="text-input"] input').clear().type('AWS');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });
        cy.get('button').contains('Test').should('be.visible');
        cy.get('[data-cy="inputs-aws-access-key"]').type('accessKey');
        cy.get('[data-cy="inputs-aws-secret-key"]').type('awsSecretKey');
        cy.get('[data-cy="secret-management-input"]').should('not.exist');
        cy.clickButton('Cancel');
      });

      it('should show field linking modal when secret management button is clicked', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();
        cy.get('[data-cy="name"]').type('Test Link Modal');
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
          cy.get('[data-cy="secret-management-input"]').click();
        });
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').should('be.visible');
        cy.contains('Select external credential').should('be.visible');
      });

      it('should disable password field when linked to external credential', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();
        cy.get('[data-cy="name"]').type('Test Field Linking');
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
        cy.get('[data-cy="inputs-password-form-group"]').should('not.be.disabled');
        cy.get('[data-cy="inputs-password-form-group"]').within(() => {
          cy.get('[data-cy="secret-management-input"]').click();
        });
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="id"]').click();
        });
        cy.getBy('[data-cy="search-input"] input').type(externalCredential.name);
        cy.contains('button', externalCredential.name).click();
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.get('[data-cy="secret-path"]').type('/secret/path');
          cy.get('[data-cy="secret-key"]').type('aVerySecretKey');
          cy.getBy('[data-cy="Submit"]').click();
        });
        cy.get('[data-ouia-component-type="PF6/ModalContent"]').should('not.exist');
        cy.getBy('[data-cy="Submit"]').click();
        cy.verifyPageTitle('Test Field Linking');
        cy.getBy('[data-cy="edit-credential"]').click();
        cy.verifyPageTitle('Edit Test Field Linking');
        cy.get('[data-cy="inputs-password"]').should('have.attr', 'disabled');
      });
    });
  });
});
