import { InventoryAddUsers } from './InventoryAddUsers';
import { awxAPI } from '../../../common/api/awx-utils';

describe('InventoryAddUsers', () => {
  const component = <InventoryAddUsers />;
  const path = '/inventories/:id/user-access/add';
  const initialEntries = [`/inventories/1/user-access/add`];
  const params = {
    path,
    initialEntries,
  };

  beforeEach(() => {
    cy.intercept('GET', awxAPI`/inventories/*`, {
      fixture: 'inventory.json',
    });
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/users/',
      },
      {
        fixture: 'awx_users_options.json',
      }
    ).as('getOptions');
    cy.intercept('GET', awxAPI`/users/*`, { fixture: 'awx-normal-users.json' });
    cy.intercept('GET', awxAPI`/role_definitions/*`, {
      fixture: 'awxInventoryRoles.json',
    });
    cy.mount(component, params);
  });
  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select user(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-users"] button').should('have.class', 'pf-m-current');
    cy.get('table tbody').find('tr').should('have.length', 2);
  });
  it('can filter users by username', () => {
    cy.intercept(awxAPI`/users/?is_superuser=false&username__icontains=e2e-user-avAE*`, {
      fixture: 'users.json',
    }).as('nameFilterRequest');
    cy.filterTableByText('e2e-user-avAE');
    cy.wait('@nameFilterRequest');
    cy.clearAllFilters();
  });

  it('should validate that at least one user is selected for moving to next step', () => {
    cy.get('table tbody').find('tr').should('have.length', 2);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one user.');
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-users"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
  });

  it('should validate that at least one role is selected for moving to Review step', () => {
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.selectTableRowByCheckbox('name', 'Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected user and role in the Review step', () => {
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'Users');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'demo-user');
    cy.get('[data-cy="expandable-section-awxRoles"]').within(() => {
      cy.get('div > span').should('contain.text', 'Roles');
      cy.get('div > .pf-v5-c-badge').should('contain.text', '1');
      cy.get('[data-cy="name-column-cell"]').should('contain.text', 'Admin');
      cy.get('[data-cy="description-column-cell"]').should(
        'contain.text',
        'Has all permissions to a single inventory'
      );
    });
  });
  it('should trigger bulk action dialog on submit', () => {
    cy.intercept('POST', awxAPI`/role_user_assignments/`, {
      statusCode: 201,
      body: { user: 5, role_definition: 14, content_type: 'awx.inventory', object_id: 1 },
    }).as('createRoleAssignment');
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Finish$/);
    cy.wait('@createRoleAssignment');
    // Bulk action modal is displayed with success
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.get('table tbody').find('tr').should('have.length', 1);
      cy.get('table tbody').should('contain.text', 'demo-user');
      cy.get('table tbody').should('contain.text', 'Admin');
      cy.get('div.pf-v5-c-progress__description').should('contain.text', 'Success');
      cy.get('div.pf-v5-c-progress__status').should('contain.text', '100%');
    });
  });
});
