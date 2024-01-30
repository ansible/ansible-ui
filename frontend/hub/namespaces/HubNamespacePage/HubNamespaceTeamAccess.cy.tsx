import * as useHubContext from '../../common/useHubContext';
import mockUser from '../../../../cypress/fixtures/hub_admin.json';
import mockNamespaceResponse from '../../../../cypress/fixtures/hub_namespace.json';
import { hubAPI } from '../../common/api/formatPath';
import { HubNamespaceTeamAccess } from './HubNamespaceTeamAccess';

describe('HubNamespaceTeamAccess', () => {
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
    it('Teams list renders', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
        hasPermission: () => true,
      }));
      cy.mount(<HubNamespaceTeamAccess />);
      cy.get('tbody').find('tr').should('have.length', 1);
    });
    it('Filter teams by name', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
        hasPermission: () => true,
      }));
      cy.mount(<HubNamespaceTeamAccess />);
      cy.filterTableByText('Test Group');
      cy.contains('Test Group');
      cy.get('tbody').find('tr').should('have.length', 1);
      cy.clickButton(/^Clear all filters$/);
    });
    it('Add/delete team actions are enabled for a user with permission to edit access for the namespace', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
        hasPermission: () => true,
      }));
      cy.mount(<HubNamespaceTeamAccess />);
      cy.contains('a[data-cy="add-team"]', /^Add team$/).should(
        'have.attr',
        'aria-disabled',
        'false'
      );
      cy.contains('tr', 'Test Group').within(() => {
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete team$/).should(
          'have.attr',
          'aria-disabled',
          'false'
        );
      });
    });
    it('Add/delete team actions are disabled for a user without permission to edit access for the namespace', () => {
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
      cy.mount(<HubNamespaceTeamAccess />);
      cy.contains('a[data-cy="add-team"]', /^Add team$/).should(
        'have.attr',
        'aria-disabled',
        'true'
      );
      cy.contains('tr', 'Test Group').within(() => {
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete team$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
    });
  });
  describe('Empty list', () => {
    it('Empty state is displayed correctly for a user with permissions to add teams', () => {
      const mockEmptyUsersResponse = { ...mockNamespaceResponse };
      mockEmptyUsersResponse.data[0].groups = [];
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
      cy.mount(<HubNamespaceTeamAccess />);
      cy.contains(/^There are currently no teams added.$/);
      cy.contains(/^Please add a team by using the button below.$/);
      cy.contains('a', /^Add team$/).should('be.visible');
      cy.contains('a', /^Add team$/).should('not.be.disabled');
    });
    it('Empty state is displayed correctly for user without permission to add teams', () => {
      const mockEmptyUsersResponse = { ...mockNamespaceResponse };
      mockEmptyUsersResponse.data[0].groups = [];
      mockEmptyUsersResponse.data[0].related_fields.my_permissions = [];
      cy.intercept(
        {
          method: 'GET',
          url: hubAPI`/_ui/v1/namespaces/?*`,
        },
        mockEmptyUsersResponse
      ).as('emptyList');
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: { ...mockUser, is_superuser: false },
        hasPermission: () => false,
      }));
      cy.mount(<HubNamespaceTeamAccess />);
      cy.contains(/^You do not have permission to add a team.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('a', /^Add team$/).should('not.exist');
    });
  });
});
