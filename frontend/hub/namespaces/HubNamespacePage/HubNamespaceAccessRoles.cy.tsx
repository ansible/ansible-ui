import * as useHubContext from '../../common/useHubContext';
import mockUser from '../../../../cypress/fixtures/hub_admin.json';
import mockNamespaceResponse from '../../../../cypress/fixtures/hub_namespace.json';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { HubNamespaceAccessRoles } from './HubNamespaceAccessRoles';

describe('HubNamespaceAccessRoles', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: hubAPI`/_ui/v1/namespaces/?*`,
      },
      mockNamespaceResponse
    ).as('namespaceDetails');
  });
  it('Roles list renders', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
      hasPermission: () => true,
    }));
    cy.mount(<HubNamespaceAccessRoles />, {
      path: '/namespaces/:id/users/:username',
      initialEntries: ['/namespaces/2/users/new-user'],
    });
    cy.get('tbody').find('tr').should('have.length', 2);
  });
  it('Role can be expanded to view permissions', () => {
    cy.intercept(
      {
        method: 'GET',
        url: pulpAPI`/roles/?*`,
      },
      {
        fixture: 'hub_namespace_permissions.json',
      }
    ).as('roleDetails');
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
      hasPermission: () => true,
      featureFlags: {},
    }));
    cy.mount(<HubNamespaceAccessRoles />, {
      path: '/namespaces/:id/users/:username',
      initialEntries: ['/namespaces/2/users/new-user'],
    });
    cy.get('#expand-toggle0 > .pf-v5-c-table__toggle-icon').click();
    cy.contains(/^Change and upload collections to namespaces.$/);
    cy.contains(/^Change namespace$/);
    cy.contains(/^Upload to namespace$/);
  });
  it('Filter roles by name', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
      hasPermission: () => true,
    }));
    cy.mount(<HubNamespaceAccessRoles />, {
      path: '/namespaces/:id/users/:username',
      initialEntries: ['/namespaces/2/users/new-user'],
    });
    cy.filterTableByText('namespace');
    cy.contains('galaxy.collection_namespace_owner');
    cy.get('tbody').find('tr').should('have.length', 1);
    cy.clickButton(/^Clear all filters$/);
  });
  it('Add/delete role actions are enabled for a user with permission to edit access for the namespace', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
      hasPermission: () => true,
    }));
    cy.mount(<HubNamespaceAccessRoles />, {
      path: '/namespaces/:id/users/:username',
      initialEntries: ['/namespaces/2/users/new-user'],
    });
    cy.contains('a[data-cy="add-role"]', /^Add role$/).should(
      'have.attr',
      'aria-disabled',
      'false'
    );
    cy.contains('tr', 'galaxy.collection_namespace_owner').within(() => {
      cy.get('button.toggle-kebab').click();
      cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete role$/).should(
        'have.attr',
        'aria-disabled',
        'false'
      );
    });
  });
  it('Add/delete role actions are disabled for a user without permission to edit access for the namespace', () => {
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
    cy.mount(<HubNamespaceAccessRoles />, {
      path: '/namespaces/:id/users/:username',
      initialEntries: ['/namespaces/2/users/new-user'],
    });
    cy.contains('a[data-cy="add-role"]', /^Add role$/).should('have.attr', 'aria-disabled', 'true');
    cy.contains('tr', 'galaxy.collection_namespace_owner').within(() => {
      cy.get('button.toggle-kebab').click();
      cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete role$/).should(
        'have.attr',
        'aria-disabled',
        'true'
      );
    });
  });
});
