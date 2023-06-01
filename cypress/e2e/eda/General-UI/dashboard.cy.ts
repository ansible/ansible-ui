//Tests a user's ability to perform certain actions on the Dashboard of the EDA UI.
//Implementation of Visual Tests makes sense here at some point
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';

describe('EDA Dashboard', () => {
  let edaProject: EdaProject;
  // let gitHookDeployRuleBook: EdaRulebook;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRBA: EdaRulebookActivation;

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
    cy.deleteEdaRulebookActivation(edaRBA);
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
  });

  it('checks Ansible header title', () => {
    cy.edaLogin();
    cy.hasTitle(/^Ansible$/).should('be.visible');
  });

  it('shows the user an RBA card with a list of RBAs visible including working links', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.get('[data-label="Name"] div > a').contains(edaRBA.name).click();
    cy.url().should('match', new RegExp('eda/rulebook-activations/details/[0-9]*'));
  });

  it('shows the user a Project card with a list of Projects visible including working links', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.get('[data-label="Name"] div > a').contains('E2E Project').click();
    cy.url().should('match', new RegExp('eda/projects/details/[0-9]*'));
  });

  it('shows the user a DE card with a list of DEs visible including working links', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.get('[data-label="Name"] div > a').contains('E2E Decision Environment').click();
    cy.url().should('match', new RegExp('eda/decision-environments/details/[0-9]*'));
  });

  it('verifies the working links - user can create a project using the CTA, when there are no projects', () => {
    cy.intercept('GET', '/api/eda/v1/projects/*').as('getProjects');
    cy.navigateTo(/^Dashboard$/);
    cy.wait('@getProjects')
      .its('response.body.results')
      .then((results: Array<EdaProject>) => {
        if (results.length === 0) {
          cy.hasTitle(/^There are currently no projects$/).should('be.visible');
          cy.contains(
            'div.pf-c-empty-state__body',
            'Create a project by clicking the button below.'
          );
          cy.clickButton(/^Create project$/);
          cy.hasTitle(/^Create project$/).should('be.visible');
        } else if (results.length >= 1) {
          cy.contains('h3', 'Projects')
            .parents('article.pf-c-card')
            .within(() => {
              cy.get('tbody tr').should('have.lengthOf.lessThan', 8);
            });
        }
      });
  });

  it('verifies the working links - user can see create an RBA(Rulebook Activation) using the CTA when there are no RBAs', () => {
    cy.intercept('GET', '/api/eda/v1/activations/*').as('getRBAs');
    cy.navigateTo(/^Dashboard$/);
    cy.wait('@getRBAs')
      .its('response.body.results')
      .then((results: Array<EdaRulebookActivation>) => {
        if (results.length === 0) {
          cy.contains('h3', 'Rulebook Activations').scrollIntoView();
          cy.hasTitle(/^There are currently no rulebook activations$/).should('be.visible');
          cy.contains(
            'div.pf-c-empty-state__body',
            'Create a rulebook activation by clicking the button below.'
          );
          cy.clickButton(/^Create rulebook activation$/);
          cy.hasTitle(/^Create rulebook activation$/).should('be.visible');
        } else if (results.length >= 1) {
          cy.contains('h3', 'Rulebook Activations')
            .scrollIntoView()
            .parents('article.pf-c-card')
            .within(() => {
              cy.get('tbody tr').should('have.lengthOf.lessThan', 8);
            });
        }
      });
  });

  it('verifies the working links - user can create a Decision Environments(DE) using the CTA, when there are no DEs', () => {
    cy.intercept('GET', '/api/eda/v1/decision-environments/*').as('getDEs');
    cy.navigateTo(/^Dashboard$/);
    cy.wait('@getDEs')
      .its('response.body.results')
      .then((results: Array<EdaDecisionEnvironment>) => {
        if (results.length === 0) {
          cy.hasTitle(/^There are currently no decision environments$/).should('be.visible');
          cy.contains(
            'div.pf-c-empty-state__body',
            'Create a decision environment by clicking the button below.'
          );
          cy.clickButton(/^Create decision environment$/);
          cy.hasTitle(/^Create decision environment$/).should('be.visible');
        } else if (results.length >= 1) {
          cy.contains('h3', 'Decision Environments')
            .parents('article.pf-c-card')
            .within(() => {
              cy.get('tbody tr').should('have.lengthOf.lessThan', 8);
            });
        }
      });
  });
});

describe('dashboard checks when resources before any resources are created', () => {
  // THIS NEEDS TO BE MOVED TO A COMPONENT TEST AS THE STATE OF THE E2E SERVER IS UNKNOWN AND THIS MAY NOT SHOW UP
  // it('checks instruction guide link works in the Getting Started section of the Dashboard page', () => {
  //   cy.navigateTo(/^Dashboard$/);
  //   cy.hasTitle(/^Getting Started$/).should('be.visible');
  //   cy.checkAnchorLinks('check out our instruct guides');
  // });

  it('checks the dashboard landing page titles ', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.hasTitle(/^Welcome to EDA Server$/).should('be.visible');
    cy.contains(
      'p span',
      'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
    ).should('be.visible');
    cy.hasTitle(/^Projects$/).should('be.visible');
    cy.contains('small', 'Recently updated projects').should('be.visible');
    cy.hasTitle(/^Rulebook Activations$/).should('be.visible');
    cy.contains('small', 'Recently updated activations').should('be.visible');
    cy.hasTitle(/^Decision Environments$/).should('be.visible');
    cy.contains('small', 'Recently updated environments').should('be.visible');
  });

  // THIS NEEDS TO BE MOVED TO A COMPONENT TEST AS THE STATE OF THE E2E SERVER IS UNKNOWN AND THIS MAY NOT SHOW UP
  // it('checks resource creation links work in the Getting Started section of the Dashboard page', () => {
  //   const resources = ['Project', 'Decision Environment', 'Rulebook Activation'];
  //   cy.navigateTo(/^Dashboard$/);
  //   cy.hasTitle(/^Getting Started$/).should('be.visible');
  //   cy.get('ol.pf-c-progress-stepper').within(() => {
  //     resources.forEach((resource) => {
  //       cy.checkAnchorLinks(resource);
  //     });
  //   });
  // });

  it('user can navigate to the Projects page using the link from the Dashboard', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.checkAnchorLinks('Go to Projects');
  });

  it('user can navigate to the Rulebook Activations page using the link from the Dashboard', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.checkAnchorLinks('Go to Rulebook Activations');
  });

  it('user can navigate to the Rulebook Activations page using the link from the Dashboard', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.checkAnchorLinks('Go to Decision Environments');
  });
});
