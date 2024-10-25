//Tests a user's ability to map event streams to sources       .

import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { ActivationRead } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { randomString } from '../../../../framework/utils/random-string';
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaCredentialCreate } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaEventStream } from '../../../../frontend/eda/interfaces/EdaEventStream';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { cyLabel } from '../../../support/cyLabel';

cyLabel(['aaas-unsupported'], function () {
  describe('Event Streams Map', () => {
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRuleBook: EdaRulebook;
    let edaOrg: EdaOrganization;
    let edaCredential: EdaCredential | undefined;
    let AAPCredential: EdaCredential | undefined;
    let edaEventStream1: EdaEventStream;
    let edaEventStream2: EdaEventStream;
    let RBA: EdaRulebookActivation;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.requestPost<EdaProject>(edaAPI`/projects/`, {
          name: 'E2E Project ' + randomString(4),
          organization_id: edaOrg.id,
          url: 'https://github.com/appuk/eda-project',
        }).then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'multiple_source_job_template.yml').then(
            (edaRuleBooks) => {
              edaRuleBook = edaRuleBooks[0];
              cy.createEdaDecisionEnvironment(edaOrg?.id).then((decisionEnvironment) => {
                edaDecisionEnvironment = decisionEnvironment;
                cy.createBasicEventStreamCredential(edaOrg.id).then((credential) => {
                  if (credential) {
                    edaCredential = credential;
                  }
                  cy.createBasicEventStream(credential, edaOrg.id).then((EdaEventStream) => {
                    edaEventStream1 = EdaEventStream;
                  });
                  cy.createBasicEventStream(credential, edaOrg.id).then((EdaEventStream) => {
                    edaEventStream2 = EdaEventStream;
                  });
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
                  });
                });
              });
            }
          );
        });
      });
    });

    after(() => {
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment, { failOnStatusCode: false });
      cy.deleteEdaProject(edaProject, { failOnStatusCode: false });
      cy.deleteEdaOrganization(edaOrg);
      cy.deleteEventStream(edaEventStream1);
      cy.deleteEventStream(edaEventStream2);
      if (edaCredential) {
        cy.deleteEdaCredential(edaCredential);
      }
      if (AAPCredential) {
        cy.deleteEdaCredential(AAPCredential);
      }
      cy.deleteEdaRulebookActivation(RBA);
    });

    it('Basic Flow -  can create a Rulebook Activation  and map event streams to sources', () => {
      const name = 'E2E Rulebook Activation ' + randomString(4);
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickLink(/^Create rulebook activation$/);
      cy.verifyPageTitle('Create rulebook activation');
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
      cy.selectDropdownOptionByResourceName('project-id', edaProject.name);
      cy.selectDropdownOptionByResourceName('rulebook', edaRuleBook.name);
      cy.selectDropdownOptionByResourceName('decision-environment-id', edaDecisionEnvironment.name);
      cy.getBy('[data-cy="organization_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.get('[id="credential-select-form-group"] [aria-label="Options menu"]').click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        if (AAPCredential) {
          cy.getBy('[data-cy="text-input"] input').type(AAPCredential.name);
        }
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.getByDataCy('select-event-stream-button').click();
      cy.selectSingleSelectOption('[data-cy="mappings-0-source-name"]', 'my first source');
      cy.selectSingleSelectOption('[data-cy="mappings-0-event-stream-id"]', edaEventStream1.name);
      cy.get('[id="0-source-info"]').contains(
        'name: my first source ansible.eda.range: limit: 6 delay: 1'
      );
      cy.clickButton(/^Add event stream$/);
      cy.selectSingleSelectOption('[data-cy="mappings-1-source-name"]', 'my second source');
      cy.selectSingleSelectOption('[data-cy="mappings-1-event-stream-id"]', edaEventStream2.name);
      cy.get('[id="1-source-info"]').contains(
        'name: my second source ansible.eda.range: limit: 100'
      );
      cy.clickButton('Save');
      cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
      cy.clickButton(/^Create rulebook activation$/);
      cy.wait('@edaRBA').then((edaRBA) => {
        RBA = edaRBA?.response?.body as ActivationRead;
        cy.get('h1').should('contain', name);
        cy.navigateTo('eda', 'rulebook-activations');
      });
    });

    it('can redirect to event streams and view activations for that event stream', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickTableRow(RBA.name, true);
      cy.verifyPageTitle(RBA.name);
      cy.get(`[href="/decisions/event-streams/${edaEventStream1.id}"]`).click();
      cy.verifyPageTitle(edaEventStream1.name);
      cy.clickTab('Activations', true);
      cy.contains('div', RBA.name);
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickTableRow(RBA.name, true);
      cy.verifyPageTitle(RBA.name);
      cy.get(`[href="/decisions/event-streams/${edaEventStream2.id}"]`).click();
      cy.verifyPageTitle(edaEventStream2.name);
      cy.clickTab('Activations', true);
      cy.contains('div', RBA.name);
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
