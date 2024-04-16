import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaRuleAudit } from '../../../../frontend/eda/interfaces/EdaRuleAudit';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('Overview - EDA Cards', () => {
  before(() => {
    cy.platformLogin();
  });

  it('verify the titles, subtitles and info icons on cards', () => {
    cy.navigateTo('platform', 'overview');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    cy.get('[data-cy="projects"]')
      .should('contain', 'Projects')
      .within(() => {
        cy.get('[data-cy="card-subtitle"]').should('contain', 'Recently updated projects');
      });

    cy.get('[data-cy="rulebook-activations"]')
      .should('contain', 'Rulebook Activations')
      .within(() => {
        cy.get('[data-cy="card-subtitle"]').should('contain', 'Recently updated activations');
      });
    cy.get('[data-cy="rulebook-activations"] .ans__sc-t3yesn-0').click();

    cy.get('[data-cy="recent-rule-audits"]')
      .should('contain', 'Rule Audit')
      .within(() => {
        cy.get('[data-cy="card-subtitle"]').should('contain', 'Recently fired rules');
      });
    cy.get('[data-cy="recent-rule-audits"] .ans__sc-t3yesn-0').click();

    cy.get('[data-cy="decision-environments"]')
      .should('contain', 'Decision Environments')
      .within(() => {
        cy.get('[data-cy="card-subtitle"]').should('contain', 'Recently updated environments');
      });
    cy.get('[data-cy="decision-environments"] .ans__sc-t3yesn-0').click();
    cy.get('*[id^="popover-pf"]').should('contain', 'Decision environments');
    cy.get('*[id^="popover-pf"]').should(
      'contain',
      'Decision environments are a container image to run Ansible rulebooks.'
    );
  });

  it('user can navigate to the resource page using the Go to link from the Dashboard', () => {
    const resources = ['Decision Environments', 'Rulebook Activations'];
    resources.forEach((resource) => {
      cy.navigateTo('platform', 'overview');
      cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
      cy.checkAnchorLinks('Go to ' + resource);
      cy.contains('a', 'Go to ' + resource).click();
      cy.verifyPageTitle(resource);
    });
  });

  it('user can create an RBA when there are none, verify working links when there are RBAs', () => {
    cy.intercept('GET', edaAPI`/activations/*`).as('getRBAs');
    cy.navigateTo('platform', 'overview');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    cy.wait('@getRBAs')
      .its('response.body.results')
      .then((results: Array<EdaRulebookActivation>) => {
        if (results.length === 0) {
          cy.get('#rulebook-activations')
            .scrollIntoView()
            .within(() => {
              cy.contains('h3', 'Rulebook Activations');
              cy.contains('There are currently no rulebook activations');
              cy.contains(
                'div.pf-v5-c-empty-state__body',
                'Create a rulebook activation by clicking the button below.'
              );
              cy.clickButton(/^Create rulebook activation$/);
            });
          cy.verifyPageTitle('Create Rulebook Activation');
        } else if (results.length >= 1) {
          cy.get('#rulebook-activations')
            .scrollIntoView()
            .within(() => {
              cy.contains('h3', 'Rulebook Activations');
              cy.get('tbody tr').should('have.lengthOf.lessThan', 8);
              cy.get('[data-label="Name"] div > a').click();
              cy.url().should(
                'match',
                new RegExp(`\\/decisions\\/decision-environments\\/[0-9]*\\/details`)
              );
            });
        }
      });
  });

  it('user can create a DE when there are none, verify working links when there are DEs', () => {
    cy.intercept('GET', edaAPI`/decision-environments/*`).as('getDEs');
    cy.navigateTo('platform', 'overview');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    cy.wait('@getDEs')
      .its('response.body.results')
      .then((results: Array<EdaDecisionEnvironment>) => {
        if (results.length === 0) {
          cy.get('#decision-environments')
            .scrollIntoView()
            .within(() => {
              cy.contains('h3', 'Decision Environments');
              cy.contains('There are currently no decision environments');
              cy.contains(
                'div.pf-v5-c-empty-state__body',
                'Create a decision environment by clicking the button below.'
              );
              cy.clickButton(/^Create decision environment$/);
            });
          cy.verifyPageTitle('Create decision environment');
        } else if (results.length >= 1) {
          cy.get('#decision-environments')
            .scrollIntoView()
            .within(() => {
              cy.contains('h3', 'Decision Environments');
              cy.get('#decision-environments tbody tr').should('have.lengthOf.lessThan', 8);
              cy.get('[data-label="Name"] a').click();
              cy.url().should(
                'match',
                new RegExp('\\/decisions\\/decision-environments\\/[0-9]*\\/details')
              );
            });
        }
      });
  });

  it('user can see empty state when there are no rule audits', () => {
    cy.intercept('GET', edaAPI`/audit-rules/*`).as('getRAs');
    cy.navigateTo('platform', 'overview');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    cy.wait('@getRAs')
      .its('response.body.results')
      .then((results: Array<EdaRuleAudit>) => {
        if (results.length === 0) {
          cy.get('#recent-rule-audits')
            .scrollIntoView()
            .within(() => {
              cy.contains('h3', 'Rule Audit');
              cy.contains('There are currently no rule audit records');
            });
        } else if (results.length >= 1) {
          cy.get('#recent-rule-audits')
            .scrollIntoView()
            .within(() => {
              cy.contains('h3', 'Rule Audit');
              cy.get('#recent-rule-audits tbody tr').should('have.lengthOf.lessThan', 8);
              cy.get('[data-label="Name"] div > a').click();
              cy.url().should('contain', '/decisions/rule-audits/');
              cy.url().should('match', new RegExp(`\\/decisions\\/rule-audits\\/[0-9]*\\/details`));
            });
        }
      });
  });
});
