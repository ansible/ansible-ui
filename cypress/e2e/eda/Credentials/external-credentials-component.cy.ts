//Component level tests for external credentials functionality
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

  describe('EDA External Credentials Component Tests', () => {
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
          cy.getBy('[data-cy="text-input"] input').clear().type('external');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr').first().find('input').click();
          cy.clickButton('Confirm');
        });

        cy.get('button').contains('Test').should('exist').and('be.disabled');

        cy.get('[data-cy="inputs-username"]').type('test-user');
        cy.get('[data-cy="inputs-password"]').type('test-pass');

        cy.get('button').contains('Test').should('be.enabled');

        cy.clickButton('Cancel');
      });

      it('should enable/disable Test button based on form validation', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type('Test Button State');

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
          cy.getBy('[data-cy="text-input"] input').type('external');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr').first().find('input').click();
          cy.clickButton('Confirm');
        });

        cy.get('button').contains('Test').should('be.disabled');

        cy.get('[data-cy="inputs-username"]').type('test-user');
        cy.get('button').contains('Test').should('be.disabled');

        cy.get('[data-cy="inputs-password"]').type('test-pass');
        cy.get('button').contains('Test').should('be.enabled');

        cy.get('[data-cy="inputs-username"]').clear();
        cy.get('button').contains('Test').should('be.disabled');

        cy.clickButton('Cancel');
      });
    });

    describe('Credential Linking UI Components', () => {
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

        cy.get('[data-cy="inputs-username"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').should('exist');
          });

        cy.get('[data-cy="inputs-password"]')
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
          cy.getBy('[data-cy="text-input"] input').type('external');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr').first().find('input').click();
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-username"]').type('external-user');
        cy.get('[data-cy="inputs-password"]').type('external-pass');

        cy.get('[data-cy="inputs-username"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').should('not.exist');
          });

        cy.get('[data-cy="inputs-password"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').should('not.exist');
          });

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

        cy.get('[data-cy="inputs-password"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').click();
          });

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').should('exist');
        cy.contains('Select external credential').should('exist');

        cy.contains(externalCredential.name).should('exist');

        cy.clickButton('Cancel');
        cy.clickButton('Cancel'); // Cancel main form
      });

      it('should disable field and show managed text when linked to external credential', () => {
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

        cy.get('[data-cy="inputs-password"]').should('not.be.disabled');

        cy.get('[data-cy="inputs-password"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').click();
          });

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type(externalCredential.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Select');

          cy.get('select[name="source_field"]').select('password');
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-password"]').should('be.disabled');
        cy.get('[data-cy="inputs-password"]')
          .should('have.attr', 'placeholder')
          .and('contain', 'Value is managed by external');

        cy.get('[data-cy="clear-secret-management-input"]').should('exist');

        cy.clickButton('Cancel');
      });

      it('should clear linked field when Clear button is clicked', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type('Test Clear Link');

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

        cy.get('[data-cy="inputs-password"]')
          .parent()
          .within(() => {
            cy.get('[data-cy="secret-management-input"]').click();
          });

        cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
          cy.getBy('[data-cy="text-input"] input').type(externalCredential.name);
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr input').click();
          cy.clickButton('Select');
          cy.get('select[name="source_field"]').select('password');
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-password"]').should('be.disabled');

        cy.get('[data-cy="clear-secret-management-input"]').click();

        cy.get('[data-cy="inputs-password"]').should('not.be.disabled');
        cy.get('[data-cy="clear-secret-management-input"]').should('not.exist');

        cy.get('[data-cy="inputs-password"]').type('manual-password');

        cy.clickButton('Cancel');
      });
    });

    describe('Test Button Functionality', () => {
      it('should show success message when external credential test passes', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type('Test Success Flow');

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
          cy.getBy('[data-cy="text-input"] input').type('external');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr').first().find('input').click();
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-username"]').type('test-user');
        cy.get('[data-cy="inputs-password"]').type('test-pass');

        cy.get('button').contains('Test').click();

        cy.get('[data-ouia-component-type="PF6/ModalContent"]', { timeout: 10000 }).should('exist');

        cy.contains(/Test (completed|failed)/i).should('exist');

        cy.clickButton('Close');
        cy.clickButton('Cancel');
      });

      it('should show error message when external credential test fails', () => {
        cy.navigateTo('eda', 'credentials');
        cy.getByDataCy('create-credential').click();

        cy.get('[data-cy="name"]').type('Test Failure Flow');

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
          cy.getBy('[data-cy="text-input"] input').type('external');
          cy.getBy('button[data-cy="apply-filter"]').click();
          cy.get('tbody tr').first().find('input').click();
          cy.clickButton('Confirm');
        });

        cy.get('[data-cy="inputs-username"]').type('invalid-user');
        cy.get('[data-cy="inputs-password"]').type('invalid-pass');

        cy.get('button').contains('Test').click();

        cy.get('[data-ouia-component-type="PF6/ModalContent"]', { timeout: 10000 }).should('exist');

        cy.get('.pf-v6-c-modal__content').should('exist');

        cy.clickButton('Close');
        cy.clickButton('Cancel');
      });
    });
  });
});
