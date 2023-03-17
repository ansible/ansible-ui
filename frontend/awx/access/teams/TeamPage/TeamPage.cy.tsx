import { Page } from '@patternfly/react-core';
import { MemoryRouter } from 'react-router-dom';
import { TeamPage } from './TeamPage';

describe('TeamPage', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/teams/*',
        hostname: 'localhost',
      },
      {
        fixture: 'team.json',
      }
    );
  });
  it('Component renders and displays team in breadcrumb', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/api/v2/teams/2']}>
        <Page>
          <TeamPage />
        </Page>
      </MemoryRouter>
    );
    cy.get('nav[aria-label="Breadcrumb"]').should('contain.text', 'Team 2 Org 0');
  });
  it('Edit button is visible and enabled', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/api/v2/teams/2']}>
        <Page>
          <TeamPage />
        </Page>
      </MemoryRouter>
    );
    cy.contains('button[id="edit-team"]', 'Edit team').should(
      'have.attr',
      'aria-disabled',
      'false'
    );
  });
  it('Delete button is visible but disabled due to lack of permissions to delete', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/api/v2/teams/2']}>
        <Page>
          <TeamPage />
        </Page>
      </MemoryRouter>
    );
    cy.get('button[aria-label="Actions"]').click();
    cy.contains('a.pf-c-dropdown__menu-item', 'Delete team').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
  });
  it('Displays tabs for Details, Access and Roles', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/api/v2/teams/2']}>
        <Page>
          <TeamPage />
        </Page>
      </MemoryRouter>
    );
    cy.get('button[data-ouia-component-type="PF4/TabButton"]').should('have.length', 3);
    cy.get('button[data-ouia-component-type="PF4/TabButton"]').eq(0).should('have.text', 'Details');
    cy.get('button[data-ouia-component-type="PF4/TabButton"]').eq(1).should('have.text', 'Access');
    cy.get('button[data-ouia-component-type="PF4/TabButton"]').eq(2).should('have.text', 'Roles');
  });
});
