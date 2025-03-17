import { awxAPI } from '../../support/formatApiPathForAwx';
import { edaAPI } from '../../support/formatApiPathForEDA';
import { hubAPI } from '../../support/formatApiPathForHub';
import { Config as AwxConfig } from '@ansible/common-ui/interfaces/Config';
import { Config as EdaConfig } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { AZURE_URL, SAAS_URL } from '../../support/constants';

describe('Platform Header Toolbar - Help Menu', () => {
  it('checks the help menu items', function () {
    cy.checkBuildType().then((buildType) => {
      cy.visit('/');

      // Click on help-menu
      cy.get('#help-menu-menu-toggle').click();
      // Check the docs link
      cy.checkAnchorLinks('Documentation');
      cy.get('[data-cy="masthead-documentation"]').within(() => {
        cy.get('a')
          .should('have.attr', 'href')
          .and(
            'include',
            'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform'
          );
      });

      if (buildType !== SAAS_URL && buildType !== AZURE_URL) {
        // Check the quick starts link
        cy.get('[data-cy="masthead-quickstarts"]').click();
        cy.url().should('include', '/quickstarts');
        cy.get('#help-menu-menu-toggle').click();
      }

      // Click on About to open the modal
      cy.intercept('GET', awxAPI`/ping/`).as('awxConfig');
      cy.intercept('GET', hubAPI`/`).as('hubConfig');
      cy.intercept('GET', edaAPI`/config/`).as('edaConfig');
      cy.get('[data-cy="masthead-about"]').click();

      cy.wait('@awxConfig')
        .its('response.body')
        .then((awxConfig: AwxConfig) => {
          const controllerVersion = awxConfig.version;
          cy.wait('@hubConfig')
            .its('response.body')
            .then((hubConfig: { galaxy_ng_version: string }) => {
              const galaxyVersion = hubConfig.galaxy_ng_version;
              if (buildType === SAAS_URL) {
                cy.getModal().within(() => {
                  cy.get('dt')
                    .contains('Automation Controller Version') // Check the Automation Controller Version
                    .next()
                    .should('have.text', controllerVersion);
                  cy.get('dt')
                    .contains('Automation Hub Version') // Check the Automation Hub Version
                    .next()
                    .should('have.text', galaxyVersion);
                  cy.get('[class*="about-modal-box__close"]').click();
                });
              } else {
                cy.wait('@edaConfig')
                  .its('response.body')
                  .then((edaConfig: EdaConfig) => {
                    const edaVersion = edaConfig.version;
                    cy.getModal().within(() => {
                      cy.get('dt')
                        .contains('Automation Controller Version') // Check the Automation Controller Version
                        .next()
                        .should('have.text', controllerVersion);
                      cy.get('dt')
                        .contains('Event-Driven Ansible Version') // Check the Event-Driven Ansible Version
                        .next()
                        .should('have.text', edaVersion);
                      cy.get('dt')
                        .contains('Automation Hub Version') // Check the Automation Hub Version
                        .next()
                        .should('have.text', galaxyVersion);
                      cy.get('[class*="about-modal-box__close"]').click();
                    });
                  });
              }
            });
        });
    });
  });
});
