import { edaAPI } from '../../common/eda-utils';
import { EdaAddUserRoles } from './EdaAddUserRoles';

describe('EDA user: Add roles', () => {
  const component = <EdaAddUserRoles />;
  const path = '/user/:id/roles/add-roles';
  const initialEntries = [`/user/7/roles/add-roles`];
  const params = {
    path,
    initialEntries,
  };
  beforeEach(() => {
    cy.intercept('GET', edaAPI`/users/*`, { fixture: 'edaUser.json' });
    cy.intercept('GET', edaAPI`/role_user_assignments/*`, {
      fixture: 'edaUserRoles.json',
    });
    cy.intercept('OPTIONS', edaAPI`/role_definitions*`, {
      fixture: 'edaRoleDefinitionsOptions.json',
    });
    cy.intercept('GET', edaAPI`/role_definitions/?content_type__model=project*`, {
      fixture: 'edaProjectRoles.json',
    });
    cy.intercept('GET', edaAPI`/projects/*`, { fixture: 'edaProjects.json' });
    cy.mount(component, params);
  });
  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select a resource type');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select resources');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Select roles to apply');
    cy.get('[data-cy="wizard-nav"] li').eq(3).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-resource-type"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that a resource type is selected for moving to next step', () => {
    cy.contains(/^Select a resource type$/);
    cy.clickButton(/^Next$/);
    cy.contains('Resource type is required.').should('be.visible');
    cy.get('[data-cy="wizard-nav-item-resource-type"] button').should('have.class', 'pf-m-current');
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="project"]').click();
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-resource-type"] button').should(
      'not.have.class',
      'pf-m-current'
    );
    cy.get('[data-cy="wizard-nav-item-resources"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that a resource is selected for moving to next step', () => {
    cy.contains(/^Select a resource type$/);
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="project"]').click();
    cy.clickButton(/^Next$/);
    cy.contains(/^Select projects$/);
    cy.contains(
      /^Choose the resources that will be receiving new roles. You'll be able to select the roles to apply in the next step. Note that the resources chosen here will receive all roles chosen in the next step.$/
    );
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one resource.');
    cy.selectTableRow('Project 1', false);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that a role is selected for moving to next step', () => {
    cy.contains(/^Select a resource type$/);
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="project"]').click();
    cy.clickButton(/^Next$/);
    cy.contains(/^Select projects$/);
    cy.selectTableRow('Project 1', false);
    cy.clickButton(/^Next$/);
    cy.contains(/^Select roles to apply to all of your selected projects.$/);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected resources and roles in the Review step', () => {
    cy.contains(/^Select a resource type$/);
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="project"]').click();
    cy.clickButton(/^Next$/);
    cy.contains(/^Select projects$/);
    cy.selectTableRow('Project 1', false);
    cy.clickButton(/^Next$/);
    cy.contains(/^Select roles to apply to all of your selected projects.$/);
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.hasDetail(/^Resource type$/, 'Project');
    cy.get('[data-cy="expandable-section-resources"]').should('contain.text', 'Resources');
    cy.get('[data-cy="expandable-section-resources"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-resources"]').should('contain.text', 'Project 1');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Roles');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Project Admin');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Has all permissions to a single project and its child resources - rulebook'
    );
  });
});
