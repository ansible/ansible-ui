import mockPlatformOrganizations from '@ansible/cypress/fixtures/platformOrganizations.json';
import { gatewayAPI } from '@ansible/cypress/support/formatApiPathForPlatform';
import { PlatformOrganizationUsers } from './PlatformOrganizationUsers';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];
mockPlatformOrganization.id = 1;

describe('Organization users list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/organizations/1/users/?*`,
        },
        {
          fixture: 'platformOrganizationUsers.json',
        }
      ).as('organizationUsersList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/organizations/1/`,
        },
        mockPlatformOrganization
      ).as('organization');
    });

    it('Users list renders', () => {
      cy.mount(<PlatformOrganizationUsers />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/users'],
      });
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 2);
      // Toolbar actions are visible
      cy.get(`[data-cy="assign-users"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab').click();
        cy.document()
          .its('body')
          .find('.pf-v6-c-menu__content')
          .within(() => {
            cy.get('button')
              .contains(/^Remove users$/)
              .should('be.visible');
          });
      });
      // Row actions are visible
      cy.contains('td', 'test-user1')
        .parent()
        .within(() => {
          cy.get('[data-cy="manage-organization-roles"]').should('exist');
          cy.get('button.toggle-kebab').click();
          cy.document()
            .its('body')
            .find('.pf-v6-c-menu__content')
            .within(() => {
              cy.get('button')
                .contains(/^Remove user$/)
                .should('exist');
            });
        });
    });
  });
});
