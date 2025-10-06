//Tests a user's ability to map event streams to sources       .

import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { EdaCredential, EdaCredentialCreate } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaEventStream } from '@ansible/eda-ui/interfaces/EdaEventStream';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { ActivationRead } from '@ansible/eda-ui/interfaces/generated/eda-api';
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

  describe('Event Streams Map', () => {
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRuleBook: EdaRulebook;
    let edaOrg: EdaOrganization;
    let edaCredential: EdaCredential;
    let AAPCredential: EdaCredential;
    let edaEventStream1: EdaEventStream;
    let edaRBA1: EdaRulebookActivation;

    beforeEach(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.requestPost<EdaProject>(edaAPI`/projects/`, {
          name: 'E2E Project ' + randomString(4),
          organization_id: edaOrg.id,
          url: 'https://github.com/Alex-Izquierdo/eda-sample-project',
        }).then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment(edaOrg?.id).then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
              cy.createBasicEventStreamCredential(edaOrg.id).then((credential) => {
                if (credential) {
                  edaCredential = credential;
                }
                cy.createBasicEventStream(edaCredential, edaOrg.id).then((EdaEventStream) => {
                  edaEventStream1 = EdaEventStream;
                  cy.requestPost<EdaCredentialCreate>(edaAPI`/eda-credentials/`, {
                    name: 'E2E Credential ' + randomString(4),
                    organization_id: edaOrg.id,
                    credential_type_id: 4,
                    description: 'This is a RH AAP Credential',
                    inputs: {
                      host: 'abc@xyz.com',
                      username: 'test_username',
                      password: 'password',
                    },
                  }).then((cred) => {
                    cy.getEdaCredentialByName(cred.name).then((credential) => {
                      if (credential) {
                        AAPCredential = credential;
                      }
                    });

                    const name = 'E2E Rulebook Activation ' + randomString(4);
                    cy.navigateTo('eda', 'rulebook-activations');
                    cy.clickLink('Create rulebook activation');
                    cy.verifyPageTitle('Create rulebook activation');
                    cy.get('[data-cy="name"]').type(name);
                    cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
                    cy.get('[data-cy="project_id"]').click();
                    cy.clickButton('Browse');
                    cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
                      cy.get('table').should('exist');
                      cy.getBy('[data-cy="text-input"] input').type(edaProject.name);
                      cy.getBy('button[data-cy="apply-filter"]').click();
                      cy.get('tbody tr input').click();
                      cy.clickButton('Confirm');
                    });
                    cy.get('[data-cy="rulebook_id"]').click();
                    cy.clickButton('Browse');
                    cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
                      cy.get('table').should('exist');
                      cy.getBy('[data-cy="text-input"] input').type(edaRuleBook.name);
                      cy.getBy('button[data-cy="apply-filter"]').click();
                      cy.get('tbody tr input').click();
                      cy.clickButton('Confirm');
                    });
                    cy.singleSelectByDataCy('decision_environment_id', edaDecisionEnvironment.name);
                    cy.getBy('[data-cy="organization_id"]').click();
                    cy.clickButton('Browse');
                    cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
                      cy.get('table').should('exist');
                      cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
                      cy.getBy('button[data-cy="apply-filter"]').click();
                      cy.get('tbody tr input').click();
                      cy.clickButton('Confirm');
                    });
                    cy.get(
                      '[id="credential-select-form-group"] [aria-label="Options menu"]'
                    ).click();
                    cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
                      cy.get('table').should('exist');
                      if (AAPCredential) {
                        cy.getBy('[data-cy="text-input"] input').type(AAPCredential.name);
                      }
                      cy.getBy('button[data-cy="apply-filter"]').click();
                      cy.get('tbody tr input').click();
                      cy.clickButton('Confirm');
                    });
                    cy.getByDataCy('select-event-stream-button').click();
                    cy.selectSingleSelectOption('[data-cy="mappings-0-source-name"]', '__SOURCE_1');
                    cy.selectSingleSelectOption(
                      '[data-cy="mappings-0-event-stream-id"]',
                      edaEventStream1.name
                    );
                    cy.get('[id="0-source-info"]').contains('ansible.eda.range:');
                    cy.clickButton('Save');
                    cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
                    cy.clickButton(/^Create rulebook activation$/);
                    cy.wait('@edaRBA').then((rba) => {
                      edaRBA1 = rba?.response?.body as ActivationRead;
                      cy.get('h1').should('contain', name);
                      cy.url().should('contain', '/details');
                      cy.get('[data-cy="event-stream(s)"]')
                        .should('be.visible')
                        .and('contain', edaEventStream1.name);
                      cy.get('[data-cy="name"]').should('be.visible').and('contain', name);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment, { failOnStatusCode: false });
      cy.deleteEdaProject(edaProject, { failOnStatusCode: false });
      cy.deleteEdaOrganization(edaOrg);
      cy.deleteEventStream(edaEventStream1);
      if (edaCredential) {
        cy.deleteEdaCredential(edaCredential);
      }
      if (AAPCredential) {
        cy.deleteEdaCredential(AAPCredential);
      }
      cy.deleteEdaRulebookActivation(edaRBA1);
    });

    it('Basic Flow -  can create a Rulebook Activation and map event streams to sources', () => {
      const name = 'E2E Rulebook Activation ' + randomString(4);
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickLink('Create rulebook activation');
      cy.verifyPageTitle('Create rulebook activation');
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
      cy.get('[data-cy="project_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaProject.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.get('[data-cy="rulebook_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaRuleBook.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.singleSelectByDataCy('decision_environment_id', edaDecisionEnvironment.name);
      cy.getBy('[data-cy="organization_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.get('[id="credential-select-form-group"] [aria-label="Options menu"]').click();
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        if (AAPCredential) {
          cy.getBy('[data-cy="text-input"] input').type(AAPCredential.name);
        }
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.getByDataCy('select-event-stream-button').click();
      cy.selectSingleSelectOption('[data-cy="mappings-0-source-name"]', '__SOURCE_1');
      cy.selectSingleSelectOption('[data-cy="mappings-0-event-stream-id"]', edaEventStream1.name);
      cy.get('[id="0-source-info"]').contains('ansible.eda.range:');
      cy.clickButton('Save');
      cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
      cy.clickButton(/^Create rulebook activation$/);
      cy.wait('@edaRBA');
      cy.get('h1').should('contain', name);
      cy.url().should('contain', '/details');
      cy.get('[data-cy="event-stream(s)"]')
        .should('be.visible')
        .and('contain', edaEventStream1.name);
      cy.get('[data-cy="name"]').should('be.visible').and('contain', name);
    });

    it('can redirect to event streams and view activations for that event stream', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.verifyPageTitle('Rulebook Activations');
      cy.clickTableRow(edaRBA1.name, true);
      cy.verifyPageTitle(edaRBA1.name);
      cy.get(`[href="/decisions/event-streams/${edaEventStream1.id}"]`).click();
      cy.verifyPageTitle(edaEventStream1.name);
      cy.clickTab('Activations', true);
      cy.contains('div', edaRBA1.name);
      cy.clickTableRow(edaRBA1.name, true);
      cy.verifyPageTitle(edaRBA1.name);
      cy.get(`[href="/decisions/event-streams/${edaEventStream1.id}"]`).click();
      cy.verifyPageTitle(edaEventStream1.name);
      cy.clickTab('Activations', true);
      cy.contains('div', edaRBA1.name);
    });

    it('cannot delete event stream if an activation is using it', () => {
      cy.navigateTo('eda', 'event-streams');
      cy.verifyPageTitle('Event Streams');
      cy.clickTableRow(edaEventStream1.name, true);
      cy.verifyPageTitle(edaEventStream1.name);
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-event-stream').should('have.attr', 'aria-disabled', 'true');
    });
  });
});
