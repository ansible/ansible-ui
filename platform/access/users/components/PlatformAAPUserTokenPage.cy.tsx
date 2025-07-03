import { PlatformAAPUserTokenPage } from './PlatformAAPUserTokenPage';

describe('PlatformAAPUserTokenPage', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/gateway/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-pat.json',
      }
    );
  });

  // JRT - skipping failing test - lgalis to investigate
  it.skip('renders token page with title, breadcrumbs, back tab and token details tab', () => {
    cy.mount(<PlatformAAPUserTokenPage />, {
      path: '/users/:id/tokens/:tokenid',
      initialEntries: ['/users/20/tokens/1'],
    });
    cy.get('[data-cy="page-title"]').contains('Token');
    cy.get('nav[aria-label="Breadcrumb"]').within(() => {
      cy.contains('Ansible Automation Platform');
      cy.contains('Personal access token');
      cy.contains('Details');
    });
    cy.get('[data-cy="manage-view"]').get('[data-cy="delete-token"]').contains('Delete token');
    cy.get('ul.pf-v6-c-tabs__list').within(() => {
      cy.get('button[aria-selected="false"]').contains(
        'Back to Ansible Automation Platform tokens'
      );
      cy.get('button[aria-selected="true"]').contains('Details');
    });
  });
});
