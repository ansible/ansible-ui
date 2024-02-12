import { edaAPI } from '../common/eda-utils';
import { CreateEventStream } from './EventStreamForm';

describe('Create event stream ', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/decision-environments/*` },
      {
        fixture: 'edaDecisionEnvironments.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/credentials/*` },
      {
        fixture: 'edaCredentials.json',
      }
    );
  });

  it('Create Event Stream - Displays error message on internal server error', () => {
    cy.mount(<CreateEventStream />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateEventStream />);
    cy.verifyPageTitle('Create Event Stream');
  });

  it('Validates properly', () => {
    cy.mount(<CreateEventStream />);
    cy.clickButton(/^Create event stream$/);
    ['Name', 'Decision environment'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateEventStream />);
    cy.get('[data-cy="name"]').type('Test');
    cy.selectDropdownOptionByResourceName('decision-environment-id', 'EDA Decision Environment 3');
    cy.clickButton('Create event stream');

    cy.intercept('POST', edaAPI`/event-streams/`, (req) => {
      expect(req.body).to.contain({
        project_id: 8,
        restart_policy: 'on-failure',
        decision_environment_id: 3,
        name: 'Test',
        source_type: 'ansible.eda.generic',
        is_enabled: true,
      });
    });
  });
});
