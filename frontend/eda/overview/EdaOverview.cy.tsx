import { edaAPI } from '../common/eda-utils';
import { EdaOverview } from './EdaOverview';

describe('EdaOverview.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/projects/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/decision-environments/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/users/me/awx-tokens/*` },
      {
        count: 1,
        results: [
          {
            id: 1,
            name: 'awx',
            description: '',
            user_id: 1,
            created_at: '2023-09-22T14:45:27.324303Z',
            modified_at: '2023-09-22T14:45:27.324315Z',
          },
        ],
      }
    );
    cy.mount(<EdaOverview />);
  });

  it('Overview has the correct title', () => {
    cy.contains(
      /^Connect intelligence, analytics and service requests to enable more responsive and resilient automation.$/
    ).should('be.visible');
  });

  it('Overview renders all components cards', () => {
    cy.contains('h3', 'Rulebook Activations').scrollIntoView();
    cy.contains('There are currently no rulebook activations')
      .scrollIntoView()
      .should('be.visible');
    cy.contains(
      'div.pf-v5-c-empty-state__body',
      'Create a rulebook activation by clicking the button below.'
    );
    cy.contains('h3', 'Decision Environments').scrollIntoView();
    cy.contains('There are currently no decision environments')
      .scrollIntoView()
      .should('be.visible');
    cy.contains(
      'div.pf-v5-c-empty-state__body',
      'Create a decision environment by clicking the button below.'
    );
    cy.contains('h3', 'Rule Audit').scrollIntoView();
    cy.contains('There are currently no rule audit records').scrollIntoView().should('be.visible');
    cy.contains('h3', 'Projects').scrollIntoView();
    cy.contains('There are currently no projects').scrollIntoView().should('be.visible');
    cy.contains('div.pf-v5-c-empty-state__body', 'Create a project by clicking the button below.');
  });
});
