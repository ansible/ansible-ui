import { pulpAPI } from '../../api/formatPath';
import * as useHubContext from '../../useHubContext';
import { Roles } from './Roles';
import mockUser from '../../../../cypress/fixtures/hub_admin.json';

describe('Roles List', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: pulpAPI`/roles/*`,
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
        .siblings('button[data-cy="filter-input"]')
        .should('contain', 'Galaxy-only roles');
    });
    it('Filter roles by name', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
      }));
      cy.mount(<Roles />);
      cy.intercept(pulpAPI`/roles/*name__icontains=foo*`).as('nameFilterRequest');
      cy.filterTableByText('foo');
      cy.wait('@nameFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });
    it('Filter roles by editability', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
      }));
      cy.mount(<Roles />);
      cy.intercept(pulpAPI`/roles/*locked=false*`).as('editableFilterRequest');
      cy.filterBySingleSelection('Editable', 'Editable');
      cy.wait('@editableFilterRequest');
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
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete role$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
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
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete role$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
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
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete role$/).should(
          'have.attr',
          'aria-disabled',
          'false'
        );
      });
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
          url: pulpAPI`/roles/*`,
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<Roles />);
      cy.contains('Error loading roles');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: pulpAPI`/roles/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create roles', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: mockUser,
      }));
      cy.mount(<Roles />);
      cy.contains(/^There are currently no roles.$/);
      cy.contains(/^Please add a role by using the button below.$/);
      cy.get('a[data-cy="create-role"]').should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create roles', () => {
      cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
        user: {
          ...mockUser,
          is_superuser: false,
        },
      }));
      cy.mount(<Roles />);
      cy.contains(/^You do not have permission to create a role.$/);
      cy.get('a[data-cy="create-role"]').should('not.exist');
    });
  });
});
