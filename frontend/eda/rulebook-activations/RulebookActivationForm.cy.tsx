import { API_PREFIX } from '../constants';
import { CreateRulebookActivation } from './RulebookActivationForm';

describe('Create rulebook activation ', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/projects/*` },
      {
        fixture: 'edaProjects.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/projects/1/*` },
      {
        fixture: 'edaProject.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/decision-environments/*` },
      {
        fixture: 'edaDecisionEnvironments.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/rulebooks/*` },
      {
        fixture: 'edaRulebooks.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/activations/*` },
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

    cy.intercept('POST', `${API_PREFIX}/activations/`, (req) => {
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
