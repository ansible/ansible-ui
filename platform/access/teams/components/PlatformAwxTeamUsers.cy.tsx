import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { PlatformAwxTeamUsers } from './PlatformAwxTeamUsers';

describe('Team users list', () => {
  const roleUserAssignmentsURL = awxAPI`/role_user_assignments/?role_definition__name=Controller%20Team%20Member*`;
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
              id: 12,
              url: '/api/v2/role_user_assignments/12/',
              related: {
                created_by: '/api/v2/users/1/',
                role_definition: '/api/v2/role_definitions/24/',
                user: '/api/v2/users/40/',
                content_object: '/api/v2/teams/1/',
              },
              summary_fields: {
                created_by: {
                  id: 1,
                  username: 'admin',
                  first_name: '',
                  last_name: '',
                },
                role_definition: {
                  id: 24,
                  name: 'Controller Team Member',
                  description: 'Has member permissions to a single team',
                  managed: true,
                },
                user: {
                  id: 40,
                  username: 'aap_user_1',
                  first_name: 'aap_user_1_first',
                  last_name: 'aap_user_1_last',
                },
                content_object: {
                  id: 1,
                  name: 'team_1',
                  description: '',
                },
              },
              created: '2024-08-26T12:15:00.037510Z',
              created_by: 1,
              content_type: 'shared.team',
              object_id: '1',
              object_ansible_id: null,
              role_definition: 24,
              user: 40,
              user_ansible_id: null,
            },
          ],
        }
      ).as('teamUsersList');
    });

    it('Users list renders', () => {
      cy.mount(<PlatformAwxTeamUsers />, {
        path: '/access/teams/:id/users/controller*',
        initialEntries: ['/access/teams/5/users/controller'],
      });
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 1);
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
      cy.mount(<PlatformAwxTeamUsers />, {
        path: '/access/teams/:id/users/controller*',
        initialEntries: ['/access/teams/5/users/controller'],
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
      cy.mount(<PlatformAwxTeamUsers />, {
        path: '/access/teams/:id/users/controllers',
        initialEntries: ['/access/teams/5/users/controllers'],
      });
      cy.contains('Error loading users');
    });
  });
});
