import { TeamPage } from './TeamPage';
import { RouteObj } from '../../../../Routes';

describe('TeamPage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/teams/*/', hostname: 'localhost' },
      { fixture: 'team.json' }
    );
    cy.mount(<TeamPage />, {
      path: RouteObj.TeamPage,
      initialEntries: [RouteObj.TeamDetails.replace(':id', '1')],
    });
  });
  it('Component renders and displays team in breadcrumb', () => {
    cy.contains('nav[aria-label="Breadcrumb"]', 'Team 2 Org 0').should('exist');
  });
  it('Edit button is visible and enabled', () => {
    cy.contains('button', 'Edit team').should('have.attr', 'aria-disabled', 'false');
  });
  it('Delete button is visible but disabled due to lack of permissions to delete', () => {
    cy.get('button[aria-label="Actions"]').click();
    cy.contains('a.pf-c-dropdown__menu-item', 'Delete team').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
  });
  it('Displays tabs for Details, Access and Roles', () => {
    cy.get('a[data-ouia-component-type="PF4/TabButton"]').should('have.length', 4);
    cy.get('a[data-ouia-component-type="PF4/TabButton"]')
      .eq(0)
      .should('have.text', 'Back to Teams');
    cy.get('a[data-ouia-component-type="PF4/TabButton"]').eq(1).should('have.text', 'Details');
    cy.get('a[data-ouia-component-type="PF4/TabButton"]').eq(2).should('have.text', 'Access');
    cy.get('a[data-ouia-component-type="PF4/TabButton"]').eq(3).should('have.text', 'Roles');
  });
});
