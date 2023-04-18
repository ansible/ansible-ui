//Tests a user's ability to perform certain actions on the Dashboard of the EDA UI.
//Implementation of Visual Tests makes sense here at some point
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';

describe('EDA Dashboard', () => {
  let edaProject: EdaProject;

  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => (edaProject = project));
  });

  after(() => {
    cy.deleteEdaProject(edaProject);
  });

  it('checks the dashboard landing page titles ', () => {
    cy.contains('a', 'Dashboard').click();
    cy.hasTitle(/^Welcome to EDA Server$/).should('be.visible');
    cy.contains(
      'p span',
      'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
    ).should('be.visible');
    cy.hasTitle(/^Projects$/).should('be.visible');
    cy.hasTitle(/^Rulebook Activations$/).should('be.visible');
  });

  it('user has the ability to create a project from the Dashboard page (checks if the links work)', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.clickButton(/^Create project$/);
    cy.hasTitle(/^Create project$/).should('be.visible');
  });

  it('user has the ability to create an RBA(Rulebook Activation) from the Dashboard page (checks if the links work)', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.clickButton(/^Create rulebook activation$/);
    cy.hasTitle(/^Create rulebook activation$/).should('be.visible');
  });

  it('user can navigate to the Projects page using the link from the Dashboard', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.intercept('GET', '/api/eda/v1/projects/?order_by=name&page=1&page_size=10').as(
      'getProjects'
    );
    cy.clickButton(/^Go to Projects$/);
    cy.wait('@getProjects').then((projects) => {
      expect(projects?.response?.statusCode).to.eql(200);
      cy.hasTitle(/^Projects$/);
    });
  });

  it('user can navigate to the Rulebook Activations page using the link from the Dashboard', () => {
    cy.intercept('GET', '/api/eda/v1/activations/?order_by=name&page=1&page_size=10').as('getRBAs');
    cy.navigateTo(/^Dashboard$/);
    cy.clickButton(/^Go to Rulebook Activations$/);
    cy.wait('@getRBAs').then((rbas) => {
      expect(rbas?.response?.statusCode).to.eql(200);
      cy.hasTitle(/^Rulebook activations$/);
    });
  });

  it('checks the count of Projects displayed on the Dashboard page', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.contains('.pf-c-card__title', 'Projects')
      .parent()
      .within(() => {
        cy.get('tbody tr').should('have.length', 4);
      });
  });

  it('checks the count of Rulebook Activations displayed on the Dashboard page', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.contains('.pf-c-card__title', 'Rulebook Activations')
      .parent()
      .within(() => {
        cy.get('tbody tr').should('have.length', 4);
      });
  });

  it('shows the user a Project card with a list of Projects visible including working links', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.get('[data-label="Name"] div > a').contains('E2E Project').click();
    cy.url().should('match', new RegExp('eda/projects/details/[0-9]*'));
  });

  it('shows the user a Rulebook Activation card with a list of Rulebook Activations visible including working links', () => {
    cy.getEdaRulebooks(edaProject).then((edaRulebooksArray) => {
      cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
        cy.createEdaRulebookActivation({
          rulebook_id: edaRulebooksArray[0].id,
          decision_environment_id: edaDecisionEnvironment.id,
        }).then((activation) => {
          cy.navigateTo(/^Dashboard$/);
          cy.get('[data-label="Name"] div > a').contains(activation.name).click();
          cy.url().should('match', new RegExp('eda/rulebook-activations/details/[0-9]*'));
          cy.deleteEdaRulebookActivation(activation);
        });
        cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
      });
    });
  });
});
