//Tests a user's ability to perform certain actions on the Dashboard of the EDA UI.
//Implementation of Visual Tests makes sense here at some point
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Overview', () => {
  let edaProject: EdaProject;
  // let gitHookDeployRuleBook: EdaRulebook;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  // let edaRBA: EdaRulebookActivation;

  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.getEdaRulebooks(edaProject).then((_edaRuleBooksArray) => {
        // gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
          // cy.createEdaRulebookActivation({
          //   rulebook_id: gitHookDeployRuleBook.id,
          //   decision_environment_id: decisionEnvironment.id,
          // }).then((edaRulebookActivation) => {
          //   edaRBA = edaRulebookActivation;
          // });
        });
      });
    });
  });

  after(() => {
    // cy.deleteEdaRulebookActivation(edaRBA);
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
  });

  it('checks Ansible header title', () => {
    cy.navigateTo('eda', 'overview');
    cy.get('.pf-v5-c-title').should('contain', 'Welcome to');
  });

  // it('shows the user an RBA card with a list of RBAs visible including working links', () => {
  //   cy.navigateTo(/^Dashboard$/);
  //   cy.get('[data-label="Name"] div > a').contains(edaRBA.name).click();
  //   cy.url().should('match', new RegExp('eda/rulebook-activations/details/[0-9]*'));
  // });

  it('shows the user a Project card with a list of Projects visible including working links', () => {
    cy.navigateTo('eda', 'overview');
    cy.get('[data-label="Name"] div > a').contains('E2E Project').click();
    // cy.url().should('match', new RegExp('eda/projects/details/[0-9]*'));
  });

  it('shows the user a DE card with a list of DEs visible including working links', () => {
    cy.navigateTo('eda', 'overview');
    cy.get('[data-label="Name"] div > a').contains('E2E Decision Environment').click();
    // cy.url().should('match', new RegExp('eda/decision-environments/details/[0-9]*'));
  });

  it('verifies the working links - user can create a project using the CTA, when there are no projects', () => {
    cy.intercept('GET', edaAPI`/projects/*`).as('getProjects');
    cy.navigateTo('eda', 'overview');
    cy.wait('@getProjects')
      .its('response.body.results')
      .then((results: Array<EdaProject>) => {
        if (results.length === 0) {
          cy.get('#projects')
            .scrollIntoView()
            .within(() => {
              cy.verifyPageTitle('There are currently no projects');
              cy.contains(
                'div.pf-v5-c-empty-state__body',
                'Create a project by clicking the button below.'
              );
              cy.clickButton(/^Create project$/);
            });
          cy.verifyPageTitle('Create project');
        } else if (results.length >= 1) {
          cy.get('#projects')
            .scrollIntoView()
            .within(() => {
              cy.contains('h3', 'Projects');
              cy.get('tbody tr').should('have.lengthOf.lessThan', 8);
            });
        }
      });
  });

  it('verifies the working links - user can see create an RBA(Rulebook Activation) using the CTA when there are no RBAs', () => {
    cy.intercept('GET', edaAPI`/activations/*`).as('getRBAs');
    cy.navigateTo('eda', 'overview');
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
            });
        }
      });
  });

  it('verifies the working links - user can create a Decision Environments(DE) using the CTA, when there are no DEs', () => {
    cy.intercept('GET', edaAPI`/decision-environments/*`).as('getDEs');
    cy.navigateTo('eda', 'overview');
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
            });
        }
      });
  });
});

describe('overview checks when resources before any resources are created', () => {
  let edaProject: EdaProject;
  // let gitHookDeployRuleBook: EdaRulebook;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  // let edaRBA: EdaRulebookActivation;

  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.getEdaRulebooks(edaProject).then((_edaRuleBooksArray) => {
        // gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
          // cy.createEdaRulebookActivation({
          //   rulebook_id: gitHookDeployRuleBook.id,
          //   decision_environment_id: decisionEnvironment.id,
          // }).then((edaRulebookActivation) => {
          //   edaRBA = edaRulebookActivation;
          // });
        });
      });
    });
  });

  after(() => {
    // cy.deleteEdaRulebookActivation(edaRBA);
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
  });

  it('checks the dashboard landing page titles ', () => {
    cy.navigateTo('eda', 'overview');
    cy.verifyPageTitle('Welcome to');
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

  // THIS NEEDS TO BE MOVED TO A COMPONENT TEST AS THE STATE OF THE E2E SERVER IS UNKNOWN AND THIS MAY NOT SHOW UP
  // it('checks resource creation links work in the Getting Started section of the Dashboard page', () => {
  //   const resources = ['Project', 'Decision Environment', 'Rulebook Activation'];
  //   cy.navigateTo('eda', 'overview');
  //   cy.verifyPageTitle('Getting Started');
  //   cy.get('ol.pf-v5-c-progress-stepper').within(() => {
  //     resources.forEach((resource) => {
  //       cy.checkAnchorLinks(resource);
  //     });
  //   });
  // });

  it('user can navigate to the Projects page using the link from the Dashboard', () => {
    cy.navigateTo('eda', 'overview');
    cy.checkAnchorLinks('Go to Projects');
  });

  it('user can navigate to the Rulebook Activations page using the link from the Dashboard', () => {
    cy.navigateTo('eda', 'overview');
    cy.checkAnchorLinks('Go to Rulebook Activations');
  });

  it('user can navigate to the Rulebook Activations page using the link from the Dashboard', () => {
    cy.navigateTo('eda', 'overview');
    cy.checkAnchorLinks('Go to Decision Environments');
  });
});
