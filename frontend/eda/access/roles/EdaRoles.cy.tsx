// import { ToolbarFilterType } from '../../../../framework';
// import * as useOptions from '../../../common/crud/useOptions';
import { EdaRoles } from './EdaRoles';

/*
Roles list test cases
1. Roles list loads
2. Filter by role name, content type, description, editable (managed)
3. RBAC on role actions handled correctly
4. Handle 500 error state
*/

describe('EdaRoles.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/eda/v1/role_definitions/*',
      },
      {
        fixture: 'edaRoleDefinitions.json',
      }
    ).as('rolesList');
  });

  it('Roles list renders', () => {
    cy.mountEda(<EdaRoles />);
    cy.verifyPageTitle('Roles');
    cy.get('tbody').find('tr').should('have.length', 15);
  });

  it('Roles list has filters for Name and Editable', () => {
    cy.mountEda(<EdaRoles />);
    cy.verifyPageTitle('Roles');
    cy.openToolbarFilterTypeSelect().within(() => {
      cy.contains(/^Name$/).should('be.visible');
      cy.contains(/^Editable$/).should('be.visible');
    });
  });

  it('Filter roles by name', () => {
    cy.mountEda(<EdaRoles />);
    cy.intercept('api/eda/v1/role_definitions/?name__startswith=admin*').as('nameFilterRequest');
    cy.filterTableByTypeAndText(/^Name$/, 'admin');
    cy.wait('@nameFilterRequest');
    cy.clickButton(/^Clear all filters$/);
  });

  it('Filter roles by editability', () => {
    cy.mountEda(<EdaRoles />);
    cy.intercept('api/eda/v1/role_definitions/?managed=false*').as('editabilityFilterRequest');
    cy.filterTableBySingleSelect('editable', 'Editable');
    cy.wait('@editabilityFilterRequest');
    cy.clearAllFilters();
  });

  it('Disables edit and delete row action for built-in roles', () => {
    cy.mountEda(<EdaRoles />);
    cy.contains('td', 'Activation Admin')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'true');
        cy.get('.pf-v5-c-dropdown__toggle').click();
        cy.get('.pf-v5-c-dropdown__menu-item')
          .contains(/^Delete role$/)
          .should('have.attr', 'aria-disabled', 'true');
      });
  });

  it('Enables edit and delete row action for editable roles when user is superuser', () => {
    cy.mountEda(<EdaRoles />);
    cy.contains('td', 'View projects')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'false');
        cy.get('.pf-v5-c-dropdown__toggle').click();
        cy.get('.pf-v5-c-dropdown__menu-item')
          .contains(/^Delete role$/)
          .should('have.attr', 'aria-disabled', 'false');
      });
  });

  it('Disables edit and delete row action for editable roles when user is normal user', () => {
    cy.mountEda(<EdaRoles />, undefined, 'edaNormalUser.json');
    cy.contains('td', 'View projects')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'true');
        cy.get('.pf-v5-c-dropdown__toggle').click();
        cy.get('.pf-v5-c-dropdown__menu-item')
          .contains(/^Delete role$/)
          .should('have.attr', 'aria-disabled', 'true');
      });
  });

  it('Create Role button is enabled if the user has permission to create roles', () => {
    cy.mountEda(<EdaRoles />);
    cy.contains('a', /^Create role$/).should('have.attr', 'aria-disabled', 'false');
  });

  it('Create Role button is disabled if the user does not have permission to create roles', () => {
    cy.mountEda(<EdaRoles />, undefined, 'edaNormalUser.json');
    cy.contains('a', /^Create role$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('Displays error if roles are not successfully loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/eda/v1/role_definitions/*',
      },
      {
        statusCode: 500,
      }
    ).as('projectsError');
    cy.mountEda(<EdaRoles />);
    cy.contains('Error loading roles');
  });
});
