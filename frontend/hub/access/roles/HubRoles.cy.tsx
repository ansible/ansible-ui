import mockUser from '../../../../cypress/fixtures/hub_admin.json';
import { pulpAPI } from '../../common/api/formatPath';
import * as useHubContext from '../../common/useHubContext';
import { Roles } from './HubRoles';

describe('Roles List', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: pulpAPI`/roles/` + '*',
      },
      {
        fixture: 'hub_roles.json',
      }
    );
  });
  it('Roles list renders', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.mount(<Roles />);
    cy.verifyPageTitle('Roles');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains('Role type')
      .siblings('ul.pf-v5-c-chip-group__list')
      .should('contain', 'Galaxy-only roles');
  });
  it('Filter roles by name', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.mount(<Roles />);
    cy.intercept(pulpAPI`/roles/?*name__icontains=foo*`).as('nameFilterRequest');
    cy.filterTableByText('foo');
    cy.wait('@nameFilterRequest');
    cy.clickButton(/^Clear all filters$/);
  });
  it('Filter roles by editability', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.mount(<Roles />);
    cy.intercept(pulpAPI`/roles/?*locked=false*`).as('editableFilterRequest');
    cy.filterBySingleSelection('Editable', 'Editable');
    cy.wait('@editableFilterRequest');
    cy.clickButton(/^Clear all filters$/);
  });
  it('Change filter to view all roles', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.mount(<Roles />);
    cy.intercept(pulpAPI`/roles/?*name__startswith=&*`).as('allRolesFilterRequest');
    cy.filterBySingleSelection('Role type', 'All roles');
    cy.wait('@allRolesFilterRequest');
    cy.clickButton(/^Clear all filters$/);
  });
  it('Create role button is disabled if the user is not a super user', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: {
        ...mockUser,
        is_superuser: false,
      },
    }));
    cy.mount(<Roles />);
    cy.get('a[data-cy="create-role"]').should('have.attr', 'aria-disabled', 'true');
  });
  it('Row actions (edit/delete role) are disabled for a built-in role', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.mount(<Roles />);
    cy.contains('tr', 'galaxy.ansible_repository_owner').within(() => {
      cy.get('button.toggle-kebab').click();
    });
    cy.contains('#delete-role', /^Delete role$/).should('have.attr', 'aria-disabled', 'true');
    cy.contains('tr', 'galaxy.ansible_repository_owner').within(() => {
      cy.get('[data-cy="actions-column-cell"]').within(() => {
        cy.get(`[data-cy="edit-role"]`).should('have.attr', 'aria-disabled', 'true');
      });
    });
  });
  it('Row actions for an editable role are disabled if the user is not a super user', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: {
        ...mockUser,
        is_superuser: false,
      },
    }));
    cy.mount(<Roles />);
    cy.contains('tr', 'galaxy.demorole').within(() => {
      cy.get('[data-cy="actions-column-cell"]').within(() => {
        cy.get(`[data-cy="edit-role"]`).should('have.attr', 'aria-disabled', 'true');
      });
    });
    cy.contains('tr', 'galaxy.ansible_repository_owner').within(() => {
      cy.get('button.toggle-kebab').click();
    });
    cy.contains('#delete-role', /^Delete role$/).should('have.attr', 'aria-disabled', 'true');
  });
  it('Row actions for an editable role are enabled if the user is a super user', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.mount(<Roles />);
    cy.contains('tr', 'galaxy.demorole').within(() => {
      cy.get('[data-cy="actions-column-cell"]').within(() => {
        cy.get(`[data-cy="edit-role"]`).should('have.attr', 'aria-disabled', 'false');
      });
    });
    cy.contains('tr', 'galaxy.demorole').within(() => {
      cy.get('button.toggle-kebab').click();
    });
    cy.contains('#delete-role', /^Delete role$/).should('not.have.attr', 'aria-disabled', 'true');
  });
  it('Create Role button is enabled if the user has permission to create roles', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.mount(<Roles />);
    cy.get('a[data-cy="create-role"]').should('have.attr', 'aria-disabled', 'false');
  });
  it('Displays error if roles are not successfully loaded', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
    }));
    cy.intercept(
      {
        method: 'GET',
        url: pulpAPI`/roles/` + '*',
      },
      {
        statusCode: 500,
      }
    );
    cy.mount(<Roles />);
    cy.contains('Error loading roles');
  });
});
