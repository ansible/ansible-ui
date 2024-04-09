//Tests a user's ability to perform certain actions on the Dashboard of the EDA UI.
//Implementation of Visual Tests makes sense here at some point
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaRuleAudit } from '../../../../frontend/eda/interfaces/EdaRuleAudit';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Overview', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;

  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.getEdaRulebooks(edaProject).then((_edaRuleBooksArray) => {
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
        });
      });
    });
  });

  after(() => {
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
  });

  it('user can create an RBA when there are none, verify working links when there are RBAs', () => {
    cy.intercept('GET', edaAPI`/activations/*`).as('getRBAs');
    cy.navigateTo('eda', 'overview');
    cy.verifyPageTitle('Welcome to Event Driven Automation');
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
              cy.url().should('match', new RegExp(`\\/rulebook-activations\\/[0-9]*\\/details`));
            });
        }
      });
  });

  it('user can create a DE when there are none, verify working links when there are DEs', () => {
    cy.intercept('GET', edaAPI`/decision-environments/*`).as('getDEs');
    cy.navigateTo('eda', 'overview');
    cy.verifyPageTitle('Welcome to Event Driven Automation');
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
              cy.get('tbody tr').should('have.lengthOf.lessThan', 8);
              cy.get('[data-label="Name"] div > a').first().click();
              cy.url().should('match', new RegExp('\\/[0-9]*\\/details'));
            });
        }
      });
  });

  it('user can see empty state when there are no rule audits', () => {
    cy.intercept('GET', edaAPI`/audit-rules/*`).as('getRAs');
    cy.navigateTo('eda', 'overview');
    cy.verifyPageTitle('Welcome to Event Driven Automation');
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
              cy.get('tbody tr').should('have.lengthOf.lessThan', 8);
              cy.get('[data-label="Name"] div > a').click();
              cy.url().should('contain', '/decisions/rule-audits/');
              cy.url().should('match', new RegExp(`\\/rule-audits\\/[0-9]*\\/details`));
            });
        }
      });
  });
});

describe('overview checks when resources before any resources are created', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;

  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.getEdaRulebooks(edaProject).then((_edaRuleBooksArray) => {
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
        });
      });
    });
  });

  after(() => {
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
  });

  it('verify the titles, subtitles and info icons on cards', () => {
    cy.navigateTo('eda', 'overview');
    cy.verifyPageTitle('Welcome to Event Driven Automation');
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

    cy.get('[data-cy="recent-rule-audits"]')
      .should('contain', 'Rule Audit')
      .within(() => {
        cy.get('[data-cy="card-subtitle"]').should('contain', 'Recently fired rules');
      });

    cy.get('[data-cy="decision-environments"]')
      .should('contain', 'Decision Environments')
      .within(() => {
        cy.get('[data-cy="card-subtitle"]').should('contain', 'Recently updated environments');
      });
  });

  it('user can navigate to the resource page using the Go to link from the Dashboard', () => {
    const resources = ['Project', 'Decision Environments', 'Rulebook Activations'];
    resources.forEach((resource) => {
      cy.navigateTo('eda', 'overview');
      cy.verifyPageTitle('Welcome to Event Driven Automation');
      cy.checkAnchorLinks('Go to ' + resource);
      cy.contains('a', 'Go to ' + resource).click();
      cy.verifyPageTitle(resource);
    });
  });
});
