import { edaAPI } from '../../common/eda-utils';
import { EdaProjectAddUsers } from './EdaProjectAddUsers';

describe('EdaProjectAddUsers', () => {
  const component = <EdaProjectAddUsers />;
  const path = '/projects/:id/user-access/add-users';
  const initialEntries = [`/projects/1/user-access/add-users`];
  const params = {
    path,
    initialEntries,
  };

  beforeEach(() => {
    cy.intercept('GET', edaAPI`/projects/*`, { fixture: 'edaProject.json' });
    cy.intercept('GET', edaAPI`/users/*`, { fixture: 'edaUsers.json' });
    cy.intercept('GET', edaAPI`/role_definitions/?content_type__model=project*`, {
      fixture: 'edaProjectRoles.json',
    });
    cy.mount(component, params);
  });
  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select user(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-users"] button').should('have.class', 'pf-m-current');
    cy.get('table tbody').find('tr').should('have.length', 6);
  });
  it('can filter users by username', () => {
    cy.intercept(edaAPI`/users/?name=demo*`, { fixture: 'edaUsers.json' }).as('nameFilterRequest');
    cy.filterTableByText('demo');
    cy.wait('@nameFilterRequest');
    cy.clearAllFilters();
  });
  it('should validate that at least one user is selected for moving to next step', () => {
    cy.get('table tbody').find('tr').should('have.length', 6);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one user.');
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-users"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that at least one role is selected for moving to Review step', () => {
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected user and role in the Review step', () => {
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'Users');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'demo-user');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Roles');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Project Admin');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Has all permissions to a single project and its child resources - rulebook'
    );
  });
  it('should trigger bulk action dialog on submit', () => {
    cy.intercept('POST', edaAPI`/role_user_assignments/`, {
      statusCode: 201,
      body: { user: 5, role_definition: 14, content_type: 'eda.project', object_id: 1 },
    }).as('createRoleAssignment');
    cy.selectTableRowByCheckbox('username', 'demo-user', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Finish$/);
    cy.wait('@createRoleAssignment');
    // Bulk action modal is displayed with success
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.get('table tbody').find('tr').should('have.length', 1);
      cy.get('table tbody').should('contain.text', 'demo-user');
      cy.get('table tbody').should('contain.text', 'Project Admin');
      cy.get('div.pf-v5-c-progress__description').should('contain.text', 'Success');
      cy.get('div.pf-v5-c-progress__status').should('contain.text', '100%');
    });
  });
});
