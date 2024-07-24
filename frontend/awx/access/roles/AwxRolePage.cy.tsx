import { AwxRoles } from './AwxRoles';

describe('AwxRoles', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/role_definitions/*',
      },
      {
        fixture: 'awxRoleDefinitions.json',
      }
    ).as('rolesList');
  });

  it('should render roles list', () => {
    cy.mount(<AwxRoles />);
    cy.verifyPageTitle('Roles');
    cy.get('tbody').find('tr').should('have.length', 10);
  });

  it('should have filters for Name and Editable', () => {
    cy.mount(<AwxRoles />);
    cy.verifyPageTitle('Roles');
    cy.openToolbarFilterTypeSelect().within(() => {
      cy.contains(/^Name$/).should('be.visible');
      cy.contains(/^Editable$/).should('be.visible');
    });
  });

  it('should filter roles by name', () => {
    cy.mount(<AwxRoles />);
    cy.intercept('api/v2/role_definitions/?name__icontains=admin*').as('nameFilterRequest');
    cy.filterTableByTypeAndText(/^Name$/, 'admin');
    cy.wait('@nameFilterRequest');
    cy.clickButton(/^Clear all filters$/);
  });

  it('should filter roles by editability', () => {
    cy.mount(<AwxRoles />);
    cy.intercept('api/v2/role_definitions/?managed=false*').as('editabilityFilterRequest');
    cy.filterTableBySingleSelect('editable', 'Editable');
    cy.wait('@editabilityFilterRequest');
    cy.clearAllFilters();
  });

  it('should disable edit and delete row action for built-in roles', () => {
    cy.mount(<AwxRoles />);
    cy.contains('td', 'Credential Admin')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('actions-dropdown').click();
      });
    cy.contains('#delete-role', /^Delete role$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('should enable edit and delete row action for editable roles when user is superuser', () => {
    cy.mount(<AwxRoles />);
    cy.contains('td', 'Inventory Read')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'false');
        cy.getByDataCy('actions-dropdown').click();
      });
    cy.contains('#delete-role', /^Delete role$/).should('not.have.attr', 'aria-disabled', 'true');
  });

  it('should disable edit and delete row action for editable roles when user is normal user', () => {
    cy.mount(<AwxRoles />, undefined, 'awxNormalUser.json');
    cy.contains('td', 'Inventory Read')
      .parent()
      .within(() => {
        cy.get('#edit-role').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('actions-dropdown').click();
      });
    cy.contains('#delete-role', /^Delete role$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('should enable Create Role button if the user has permission to create roles', () => {
    cy.mount(<AwxRoles />);
    cy.contains('a', /^Create role$/).should('have.attr', 'aria-disabled', 'false');
  });

  it('should disable Create Role button if the user does not have permission to create roles', () => {
    cy.mount(<AwxRoles />, undefined, 'awxNormalUser.json');
    cy.contains('a', /^Create role$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('should display error if roles are not successfully loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/role_definitions/*',
      },
      {
        statusCode: 500,
      }
    ).as('projectsError');
    cy.mount(<AwxRoles />);
    cy.contains('Error loading roles');
  });
});
