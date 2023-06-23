import { RouteObj } from '../../../Routes';
import { EdaDashboard } from '../EdaDashboard';
import { API_PREFIX } from '../../constants';

describe('EdaDecisionEnvironmentsCard.cy.ts', () => {
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
        count: 1,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'DE1',
            description: 'This is DE1',
            image_url: 'quay.io/ansible/ansible-rulebook:latest',
            credential_id: null,
            id: 2,
            created_at: '2023-06-21T13:35:14.393063Z',
            modified_at: '2023-06-21T13:35:14.393075Z',
          },
        ],
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
  it('Dashboard renders the correct decision environment columns', () => {
    cy.contains(/^Recently updated environments$/).should('be.visible');
    cy.contains('th', 'Name');
    cy.contains('th', 'Last modified');
  });
});
