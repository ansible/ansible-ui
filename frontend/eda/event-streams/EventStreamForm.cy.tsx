import { edaAPI } from '../common/eda-utils';
import { CreateEventStream } from './EventStreamForm';

describe('Create event stream ', () => {
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
      { method: 'GET', url: edaAPI`/event-streams/*` },
      {
        fixture: 'edaEventStreams.json',
      }
    );
  });

  it('Create Event Stream - Displays error message on internal server error', () => {
    cy.mount(<CreateEventStream />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateEventStream />);
    cy.verifyPageTitle('Create Event stream');
  });

  it('Validates properly', () => {
    cy.mount(<CreateEventStream />);
    cy.clickButton(/^Create event stream$/);
    ['Name', 'Decision environment', 'Rulebook'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateEventStream />);
    cy.get('[data-cy="name"]').type('Test');
    cy.selectDropdownOptionByResourceName('decision-environment-id', 'EDA Decision Environment 3');
    cy.selectDropdownOptionByResourceName('project-id', 'Project 4');
    cy.selectDropdownOptionByResourceName('rulebook', 'hello_echo.yml');
    cy.clickButton('Create event stream');

    cy.intercept('POST', edaAPI`/event-streams/`, (req) => {
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
