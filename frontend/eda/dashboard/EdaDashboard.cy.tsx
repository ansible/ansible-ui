import { RouteObj } from '../../Routes';
import { EdaDashboard } from './EdaDashboard';
import { API_PREFIX } from '../constants';

describe('EdaDashboard.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/projects/*` },
      {
        count: 0,
        results: [],
      }
    );

    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/activations/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/decision-environments/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/audit-rules/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/audit-rules/` },
      {
        count: 0,
        results: [],
      }
    );
    cy.mount(<EdaDashboard />, {
      path: RouteObj.EdaDashboard,
      initialEntries: [RouteObj.EdaDashboard],
    });
  });
  it('Dashboard has the correct title', () => {
    cy.contains(
      /^Connect intelligence, analytics and service requests to enable more responsive and resilient automation.$/
    ).should('be.visible');
  });
  it('Dashboard renders all components cards', () => {
    cy.contains('h3', 'Rulebook Activations').scrollIntoView();
    cy.hasTitle(/^There are currently no rulebook activations$/).should('be.visible');
    cy.contains(
      'div.pf-c-empty-state__body',
      'Create a rulebook activation by clicking the button below.'
    );
    cy.contains('h3', 'Decision Environments').scrollIntoView();
    cy.hasTitle(/^There are currently no decision environments$/).should('be.visible');
    cy.contains(
      'div.pf-c-empty-state__body',
      'Create a decision environment by clicking the button below.'
    );
    cy.contains('h3', 'Rule Audit').scrollIntoView();
    cy.hasTitle(/^There are currently no rule audit records$/).should('be.visible');
    cy.contains('h3', 'Projects').scrollIntoView();
    cy.hasTitle(/^There are currently no projects$/).should('be.visible');
    cy.contains('div.pf-c-empty-state__body', 'Create a project by clicking the button below.');
  });
});
