import mockPlatformOrganizations from '@ansible/cypress/fixtures/platformOrganizations.json';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformOrganizationAssignUsers } from './PlatformOrganizationAssignUsers';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];

describe('PlatformOrganizationAssignUsers', () => {
  const component = <PlatformOrganizationAssignUsers />;
  const path = '/organizations/:id/users/add-users';
  const initialEntries = [`/organizations/1/users/add-users`];
  const params = {
    path,
    initialEntries,
  };
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: gatewayAPI`/organizations/1/`,
      },
      mockPlatformOrganization
    ).as('organization');
    cy.intercept('GET', gatewayAPI`/users/?is_superuser=false*`, {
      fixture: 'platformNormalUsers.json',
    }).as('userListFilteredByNormalUsers');
    cy.intercept(
      'GET',
      gatewayAPI`/role_definitions/?content_type__api_slug=shared.organization*`,
      {
        fixture: 'platformOrganizationRoles.json',
      }
    ).as('organizationRoles');
    cy.intercept('GET', gatewayAPI`/role_definitions?name=Organization+Member`, {
      fixture: 'platformOrganizationMemberRole.json',
    }).as('organizationUserRole');
  });

  it('should render with correct wizard steps', () => {
    cy.mount(component, params);
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select user(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select organization roles');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-users"] button').should('have.class', 'pf-m-current');
    cy.wait('@userListFilteredByNormalUsers');
  });

  it('should validate that a user is selected before moving to the next step', () => {
    cy.mount(component, params);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v6-c-alert__title').should('contain.text', 'Select at least one user.');
    cy.get('[data-cy="wizard-nav-item-users"] button').should('have.class', 'pf-m-current');
    cy.selectTableRowByCheckbox('username', 'test', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-users"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });

  it('should validate that a role is selected before moving to the next step', () => {
    cy.mount(component, params);
    cy.selectTableRowByCheckbox('username', 'test', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-users"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('.pf-v6-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });

  it('should display organization roles in the roles step', () => {
    cy.mount(component, params);
    cy.selectTableRowByCheckbox('username', 'test', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.wait('@organizationRoles');
    cy.contains('Select organization roles');

    // Check that AWX roles are displayed
    cy.contains('Organization Credential Admin');
    cy.contains('Organization Inventory Admin');
    cy.contains('Organization Project Admin');

    // Check that EDA roles are displayed
    cy.contains('Auditor');
    cy.contains('Contributor');
    cy.contains('Editor');
    cy.contains('Viewer');

    cy.clearAllFilters();
  });

  it('should display selected users and roles in the Review step with component labels', () => {
    cy.mount(component, params);
    cy.selectTableRowByCheckbox('username', 'test', { disableFilter: true });
    cy.selectTableRowByCheckbox('username', 'testuser2', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.wait('@organizationRoles');
    cy.contains('Select organization roles');

    // Select AWX roles
    cy.selectTableRowByCheckbox('name', 'Organization Credential Admin', { disableFilter: true });
    cy.selectTableRowByCheckbox('name', 'Organization Inventory Admin', { disableFilter: true });

    // Select EDA roles
    cy.selectTableRowByCheckbox('name', 'Contributor', { disableFilter: true });

    cy.get('[data-cy="Submit"]').should('be.visible').click();
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');

    // Check selected users
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'Users');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', '2');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'test');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'testuser2');

    // Check selected roles with component labels
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'Organization roles'
    );
    cy.get('[data-cy="expandable-section-platformRoles"]').should('contain.text', '3');
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'Organization Credential Admin'
    );
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'Organization Inventory Admin'
    );
    cy.get('[data-cy="expandable-section-platformRoles"]').should('contain.text', 'Contributor');

    // Check role descriptions
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'Has all permissions to credentials within an organization'
    );
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'Has all permissions to inventories within an organization'
    );
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'Has create and update permissions with an exception of users and roles. Has enable and disable rulebook activation permissions.'
    );

    // Check component labels in the Component column
    cy.get('[data-cy="expandable-section-platformRoles"]').within(() => {
      // AWX roles should show "Automation Execution" component
      cy.contains('Automation Execution');
      // EDA roles should show "Automation Decisions" component
      cy.contains('Automation Decisions');
    });
  });
});
