import { hubAPI } from '@ansible/cypress/support/formatApiPathForHub';
import { PlatformHubTeamUsers } from './PlatformHubTeamUsers';

describe('Platform team users hub list', () => {
  const roleUserAssignmentsURL = hubAPI`/_ui/v2/role_user_assignments/?role_definition__name=Galaxy%20Team%20Member&object_id=2*`;
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: roleUserAssignmentsURL,
        },
        {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 4,
              url: '/api/galaxy/_ui/v2/role_user_assignments/4/',
              related: {
                created_by: '/api/galaxy/_ui/v2/users/16/',
                role_definition: '/api/galaxy/_ui/v2/role_definitions/3/',
                user: '/api/galaxy/_ui/v2/users/29/',
                content_object: '/api/galaxy/_ui/v2/teams/2/',
              },
              summary_fields: {
                created_by: {
                  id: 16,
                  username: 'dev',
                  first_name: '',
                  last_name: '',
                },
                role_definition: {
                  id: 3,
                  name: 'Galaxy Team Member',
                  description: 'Inherits all role assignments to a single team',
                  managed: true,
                },
                user: {
                  id: 29,
                  username: 'user_1',
                  first_name: 'first_1',
                  last_name: 'last_1',
                },
                content_object: {
                  id: 2,
                  name: 'team_2',
                },
              },
              created: '2024-08-27T12:35:52.514436Z',
              created_by: 16,
              content_type: 'shared.team',
              object_id: '2',
              object_ansible_id: null,
              role_definition: 3,
              user: 29,
              user_ansible_id: null,
            },
          ],
        }
      );
    });

    it('Users list renders', () => {
      cy.mount(<PlatformHubTeamUsers />, {
        path: '/access/teams/:id/users/hub*',
        initialEntries: ['/access/teams/2/users/hub'],
      });
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 1);

      // Row action visible
      cy.contains('td', 'user_1')
        .parent()
        .within(() => {
          cy.getByDataCy('actions-dropdown').click();
        });
      cy.contains('#remove-user', /^Remove user$/).should('exist');

      // Toolbar actions are visible
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab').click();
        cy.document()
          .its('body')
          .find('.pf-v5-c-menu__content')
          .within(() => {
            cy.get('button')
              .contains(/^Remove users$/)
              .should('be.visible');
          });
      });
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: roleUserAssignmentsURL,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly', () => {
      cy.mount(<PlatformHubTeamUsers />, {
        path: '/access/teams/:id/users/hub*',
        initialEntries: ['/access/teams/2/users/hub'],
      });
      cy.contains(/^There are currently no users added to this team.$/);
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading users', () => {
      cy.intercept(
        {
          method: 'GET',
          url: roleUserAssignmentsURL,
        },
        { statusCode: 500 }
      ).as('error');
      cy.mount(<PlatformHubTeamUsers />, {
        path: '/access/teams/:id/users/hub',
        initialEntries: ['/access/teams/2/users/hub'],
      });
      cy.contains('Error loading users');
    });
  });
});
