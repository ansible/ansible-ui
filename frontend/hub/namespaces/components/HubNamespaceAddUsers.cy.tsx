import { hubAPI } from '../../common/api/formatPath';
import { HubNamespaceAddUsers } from './HubNamespaceAddUsers';

describe('HubNamespaceAddUsers', () => {
  const component = <HubNamespaceAddUsers />;
  const path = '/namespaces/:id/user-access/add';
  const initialEntries = ['/namespaces/demo/user-access/add'];
  const params = {
    path,
    initialEntries,
  };

  beforeEach(() => {
    cy.intercept('GET', hubAPI`/_ui/v1/namespaces/?limit=1&name=demo*`, {
      fixture: 'hubNamespace.json',
    });
    cy.intercept('GET', hubAPI`/_ui/v2/users/?is_superuser=false*`, {
      fixture: 'hubV2Users.json',
    });
    cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/?content_type__model=namespace*`, {
      fixture: 'hubNamespaceRoles.json',
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
    cy.intercept('GET', hubAPI`/_ui/v2/users/?is_superuser=false&username__contains=demo-user*`, {
      fixture: 'hubV2Users.json',
    }).as('nameFilterRequest');
    cy.filterTableByText('demo-user');
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
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that at least one role is selected for moving to Review step', () => {
    cy.get('table tbody').find('tr').should('have.length', 2);
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected user and role in the Review step', () => {
    cy.get('table tbody').find('tr').should('have.length', 2);
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'Users');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'demo-user');
    cy.get('[data-cy="expandable-section-hubRoles"]').should('contain.text', 'Roles');
    cy.get('[data-cy="expandable-section-hubRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-hubRoles"]').should(
      'contain.text',
      'galaxy.collection_publisher'
    );
    cy.get('[data-cy="expandable-section-hubRoles"]').should(
      'contain.text',
      'Upload and modify collections.'
    );
  });
  it('should trigger bulk action dialog on submit', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_user_assignments/`, {
      statusCode: 201,
      body: { user: 6, role_definition: 4, content_type: 'galaxy.namespace', object_id: 1 },
    }).as('createRoleAssignment');
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Finish$/);
    cy.wait('@createRoleAssignment');
    // Bulk action modal is displayed with success
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.get('table tbody').find('tr').should('have.length', 1);
      cy.get('table tbody').should('contain.text', 'demo-user');
      cy.get('table tbody').should('contain.text', 'galaxy.collection_publisher');
      cy.get('div.pf-v5-c-progress__description').should('contain.text', 'Success');
      cy.get('div.pf-v5-c-progress__status').should('contain.text', '100%');
    });
  });
});
