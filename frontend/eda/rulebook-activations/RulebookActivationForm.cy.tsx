import { edaAPI } from '../common/eda-utils';
import { CreateRulebookActivation } from './RulebookActivationForm';

describe('Create rulebook activation ', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/projects/*` },
      {
        fixture: 'edaProjects.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/projects/1/*` },
      {
        fixture: 'edaProject.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/decision-environments/*` },
      {
        fixture: 'edaDecisionEnvironments.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/rulebooks/*` },
      {
        fixture: 'edaRulebooks.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/*` },
      {
        fixture: 'edaRulebookActivations.json',
      }
    );
  });

  it('Create Rulebook Activation - Displays error message on internal server error', () => {
    cy.mount(<CreateRulebookActivation />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateRulebookActivation />);
    cy.verifyPageTitle('Create Rulebook Activation');
  });

  it('Validates properly', () => {
    cy.mount(<CreateRulebookActivation />);
    cy.clickButton(/^Create rulebook activation$/);
    ['Name', 'Decision environment', 'Rulebook'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateRulebookActivation />);
    cy.get('[data-cy="name"]').type('Test');
    cy.selectDropdownOptionByResourceName('decision-environment-id', 'EDA Decision Environment 3');
    cy.selectDropdownOptionByResourceName('project-id', 'Project 4');
    cy.selectDropdownOptionByResourceName('rulebook', 'hello_echo.yml');
    cy.clickButton('Create rulebook activation');

    cy.intercept('POST', edaAPI`/activations/`, (req) => {
      expect(req.body).to.contain({
        project_id: 8,
        restart_policy: 'on-failure',
        decision_environment_id: 3,
        name: 'Test',
        rulebook_id: 'hello_echo.yml',
        is_enabled: true,
      });
    });
  });
});
