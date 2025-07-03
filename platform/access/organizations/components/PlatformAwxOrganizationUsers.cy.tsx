import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { PlatformAwxOrganizationUsers } from './PlatformAwxOrganizationUsers';

describe('Platform organization users controller list', () => {
  const roleUserAssignmentsURL = awxAPI`/role_user_assignments/?role_definition__name=Controller%20Organization%20Member*`;
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
              url: awxAPI`/role_user_assignments/4/`,
              related: {
                created_by: awxAPI`/users/1/`,
                role_definition: awxAPI`/role_definitions/31/`,
                user: awxAPI`/users/40/`,
                content_object: awxAPI`/organizations/1/`,
              },
              summary_fields: {
                created_by: {
                  id: 1,
                  username: 'admin',
                  first_name: '',
                  last_name: '',
                },
                role_definition: {
                  id: 31,
                  name: 'Controller Organization Member',
                  description: 'Has member permissions to a single organization',
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
                  name: 'Default',
                  description: '',
                },
              },
              created: '2024-08-23T01:34:08.495845Z',
              created_by: 1,
              content_type: 'shared.organization',
              object_id: '1',
              object_ansible_id: null,
              role_definition: 31,
              user: 40,
              user_ansible_id: null,
            },
          ],
        }
      );
    });

    it('Users list renders', () => {
      cy.mount(<PlatformAwxOrganizationUsers />, {
        path: '/access/organizations/:id/users/controller*',
        initialEntries: ['/access/organizations/1/users/controller'],
      });
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 1);
      // Toolbar actions are visible
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
      cy.mount(<PlatformAwxOrganizationUsers />);
      cy.contains(/^There are currently no users added to this organization.$/);
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
      cy.mount(<PlatformAwxOrganizationUsers />);
      cy.contains('Error loading users');
    });
  });
});
