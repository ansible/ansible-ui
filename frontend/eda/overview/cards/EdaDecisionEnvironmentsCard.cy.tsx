import { edaAPI } from '../../common/eda-utils';
import { EdaOverview } from '../EdaOverview';

describe('EdaDecisionEnvironmentsCard.cy.ts', () => {
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
            eda_credential_id: null,
            id: 2,
            created_at: '2023-06-21T13:35:14.393063Z',
            modified_at: '2023-06-21T13:35:14.393075Z',
          },
        ],
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
    cy.mount(<EdaOverview />);
  });
  it('Dashboard renders the correct decision environment columns', () => {
    cy.contains(/^Recently updated decision environments$/).should('be.visible');
    cy.contains('th', 'Name');
  });
});
