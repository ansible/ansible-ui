import * as useHubContext from '../../common/useHubContext';
import mockUser from '../../../../cypress/fixtures/hub_admin.json';
import mockNamespaceResponse from '../../../../cypress/fixtures/hub_namespace.json';
import { HubNamespaceUserAccess } from './HubNamespaceUserAccess';
import { hubAPI } from '../../common/api/formatPath';

describe('HubNamespaceUserAccess', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: hubAPI`/_ui/v1/namespaces/?*`,
        },
        mockNamespaceResponse
      ).as('nonEmptyListWithPermissions');
    });
    it('Users list renders', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
        hasPermission: () => true,
      }));
      cy.mount(<HubNamespaceUserAccess />);
      cy.get('tbody').find('tr').should('have.length', 2);
    });
    it('Filter users by name', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
        hasPermission: () => true,
      }));
      cy.mount(<HubNamespaceUserAccess />);
      cy.filterTableByText('new-user');
      cy.contains('new-user');
      cy.get('tbody').find('tr').should('have.length', 1);
      cy.clickButton(/^Clear all filters$/);
    });
    it('Add/delete user actions are enabled for a user with permission to edit access for the namespace', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
        hasPermission: () => true,
      }));
      cy.mount(<HubNamespaceUserAccess />);
      cy.contains('a[data-cy="add-user"]', /^Add user$/).should(
        'have.attr',
        'aria-disabled',
        'false'
      );
      cy.contains('tr', 'new-user').within(() => {
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete user$/).should(
          'have.attr',
          'aria-disabled',
          'false'
        );
      });
    });
    it('Add/delete user actions are disabled for a user without permission to edit access for the namespace', () => {
      const mockEmptyUsersResponse = { ...mockNamespaceResponse };
      mockEmptyUsersResponse.data[0].related_fields.my_permissions = [];
      cy.intercept(
        {
          method: 'GET',
          url: hubAPI`/_ui/v1/namespaces/?*`,
        },
        mockEmptyUsersResponse
      ).as('nonEmptyListWithoutPermissions');
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: { ...mockUser, is_superuser: false },
        hasPermission: () => false,
      }));
      cy.mount(<HubNamespaceUserAccess />);
      cy.contains('a[data-cy="add-user"]', /^Add user$/).should(
        'have.attr',
        'aria-disabled',
        'true'
      );
      cy.contains('tr', 'new-user').within(() => {
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete user$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
    });
  });
  describe('Empty list', () => {
    it('Empty state is displayed correctly for a user with permissions to add users', () => {
      const mockEmptyUsersResponse = { ...mockNamespaceResponse };
      mockEmptyUsersResponse.data[0].users = [];
      cy.intercept(
        {
          method: 'GET',
          url: hubAPI`/_ui/v1/namespaces/?*`,
        },
        mockEmptyUsersResponse
      ).as('emptyList');
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
        hasPermission: () => true,
      }));
      cy.mount(<HubNamespaceUserAccess />);
      cy.contains(/^There are currently no users added.$/);
      cy.contains(/^Please add a user by using the button below.$/);
      cy.contains('a', /^Add user$/).should('be.visible');
      cy.contains('a', /^Add user$/).should('not.be.disabled');
    });
    it('Empty state is displayed correctly for user without permission to add users', () => {
      const mockEmptyUsersResponse = { ...mockNamespaceResponse };
      mockEmptyUsersResponse.data[0].users = [];
      mockEmptyUsersResponse.data[0].related_fields.my_permissions = [];
      cy.intercept(
        {
          method: 'GET',
          url: hubAPI`/_ui/v1/namespaces/?*`,
        },
        mockEmptyUsersResponse
      ).as('emptyListWithoutPermissions');
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: { ...mockUser, is_superuser: false },
        hasPermission: () => false,
      }));
      cy.mount(<HubNamespaceUserAccess />);
      cy.contains(/^You do not have permission to add a user.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('a', /^Add user$/).should('not.exist');
    });
  });
});
