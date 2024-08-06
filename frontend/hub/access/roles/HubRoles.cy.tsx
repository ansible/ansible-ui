/*
Roles list test cases
1. Roles list loads
2. Filter by role name, content type, description, editable (managed)
3. RBAC on role actions handled correctly
4. Handle 500 error state
*/

import { hubAPI } from '../../common/api/formatPath';
import { PulpItemsResponse } from '../../common/useHubView';
import { HubRbacRole } from '../../interfaces/expanded/HubRbacRole';
import { HubRoles } from './HubRoles';

describe('HubRoles.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: hubAPI`/_ui/v2/role_definitions/?*`,
      },
      {
        fixture: 'hubRoleDefinitions.json',
      }
    ).as('rolesList');
  });

  it('Roles list renders', () => {
    cy.mountHub(<HubRoles />);
    cy.verifyPageTitle('Roles');
    cy.get('tbody').find('tr').should('have.length', 18);
  });

  it('Roles list has filters for Name and Editable', () => {
    cy.mountHub(<HubRoles />);
    cy.verifyPageTitle('Roles');
    cy.openToolbarFilterTypeSelect().within(() => {
      cy.contains(/^Name$/).should('be.visible');
      cy.contains(/^Editable$/).should('be.visible');
    });
  });

  it('Filter roles by name', () => {
    cy.mountHub(<HubRoles />);
    cy.intercept(hubAPI`/_ui/v2/role_definitions/?name__icontains=admin*`).as('nameFilterRequest');
    cy.filterTableByTypeAndText(/^Name$/, 'admin');
    cy.wait('@nameFilterRequest');
    cy.clickButton(/^Clear all filters$/);
  });

  it('Filter roles by editability', () => {
    cy.mountHub(<HubRoles />);
    cy.intercept(hubAPI`/_ui/v2/role_definitions/?managed=false*`).as('editabilityFilterRequest');
    cy.filterTableBySingleSelect('editable', 'Editable');
    cy.wait('@editabilityFilterRequest');
    cy.clearAllFilters();
  });

  it('Disables edit and delete row action for built-in roles', () => {
    cy.fixture('hubRoleDefinitions').then((HubRoles: PulpItemsResponse<HubRbacRole>) => {
      const role = HubRoles.results.find((role) => role.name === 'Namespace Admin');
      cy.intercept(
        { method: 'GET', url: hubAPI`/_ui/v2/role_definitions/?*` },
        {
          body: {
            count: 1,
            next: null,
            previous: null,
            page: 1,
            results: [role],
          },
        }
      );
    });
    cy.mountHub(<HubRoles />);
    cy.contains('td', 'Namespace Admin')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('actions-dropdown').click();
      });
    cy.contains('#delete-role', /^Delete role$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('Enables edit and delete row action for editable roles when user is superuser', () => {
    cy.fixture('hubRoleDefinitions').then((HubRoles: PulpItemsResponse<HubRbacRole>) => {
      const role = HubRoles.results.find((role) => role.name === 'galaxy.test_role');
      cy.intercept(
        { method: 'GET', url: hubAPI`/_ui/v2/role_definitions/?*` },
        {
          body: {
            count: 1,
            next: null,
            previous: null,
            page: 1,
            results: [role],
          },
        }
      );
    });
    cy.mountHub(<HubRoles />, undefined, 'hubSuperUser.json');
    cy.contains('td', 'galaxy.test_role')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('not.have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('actions-dropdown').click();
      });
    cy.contains('#delete-role', /^Delete role$/).should('not.have.attr', 'aria-disabled', 'true');
  });

  it('Disables edit and delete row action for editable roles when user is normal user', () => {
    cy.fixture('hubRoleDefinitions').then((HubRoles: PulpItemsResponse<HubRbacRole>) => {
      const role = HubRoles.results.find((role) => role.name === 'galaxy.test_role');
      cy.intercept(
        { method: 'GET', url: hubAPI`/_ui/v2/role_definitions/?*` },
        {
          body: {
            count: 1,
            next: null,
            previous: null,
            page: 1,
            results: [role],
          },
        }
      );
    });
    cy.mountHub(<HubRoles />, undefined, 'hubNormalUser.json');
    cy.contains('td', 'galaxy.test_role')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('actions-dropdown').click();
      });
    cy.contains('#delete-role', /^Delete role$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('Create Role button is enabled if the user has permission to create roles', () => {
    cy.mountHub(<HubRoles />);
    cy.contains('a', /^Create role$/).should('have.attr', 'aria-disabled', 'false');
  });

  it('Create Role button is disabled if the user does not have permission to create roles', () => {
    cy.mountHub(<HubRoles />, undefined, 'hubNormalUser.json');
    cy.contains('a', /^Create role$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('Displays error if roles are not successfully loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: hubAPI`/_ui/v2/role_definitions/?*`,
      },
      {
        statusCode: 500,
      }
    ).as('projectsError');
    cy.mountHub(<HubRoles />);
    cy.contains('Error loading roles');
  });
});
