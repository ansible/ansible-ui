import { hubAPI } from '../../../common/api/formatPath';
import { HubAddUserRoles } from './HubAddUserRoles';

describe('Hub user: Add roles', () => {
  const component = <HubAddUserRoles />;
  const path = '/user/:id/roles/add-roles';
  const initialEntries = [`/user/7/roles/add-roles`];
  const params = {
    path,
    initialEntries,
  };
  beforeEach(() => {
    cy.intercept('GET', hubAPI`/_ui/v2/users/7/`, { fixture: 'hubNormalUser.json' });
    cy.intercept('GET', hubAPI`/_ui/v2/role_user_assignments/?user_id=*`, {
      fixture: 'hubUserRoles.json',
    });
    cy.intercept('OPTIONS', hubAPI`/_ui/v2/role_definitions/`, {
      fixture: 'hubRoleDefinitionsOptions.json',
    });
    cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/?content_type__model=namespace*`, {
      fixture: 'hubNamespaceRoles.json',
    });
    cy.intercept('GET', hubAPI`/_ui/v1/namespaces/?sort=name*`, { fixture: 'hubNamespace.json' });
    cy.mount(component, params);
  });
  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select a resource type');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-resource-type"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that a resource type is selected for moving to next step', () => {
    cy.contains(/^Select a resource type$/);
    cy.clickButton(/^Next$/);
    cy.contains('Resource type is required.').should('be.visible');
    cy.get('[data-cy="wizard-nav-item-resource-type"] button').should('have.class', 'pf-m-current');
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="namespace"]').click();
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-resource-type"] button').should(
      'not.have.class',
      'pf-m-current'
    );
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select resources');
    cy.get('[data-cy="wizard-nav-item-resources"] button').should('have.class', 'pf-m-current');
  });
  it('the select resources step is hidden for System roles', () => {
    cy.contains(/^Select a resource type$/);
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="system"]').click();
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-resource-type"] button').should(
      'not.have.class',
      'pf-m-current'
    );
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-resources"]').should('not.exist');
  });
  it('should validate that a resource is selected for moving to next step', () => {
    cy.contains(/^Select a resource type$/);
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="namespace"]').click();
    cy.clickButton(/^Next$/);
    cy.contains(/^Select namespaces$/);
    cy.contains(
      /^Choose the resources that will be receiving new roles. You'll be able to select the roles to apply in the next step. Note that the resources chosen here will receive all roles chosen in the next step.$/
    );
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one resource.');
    cy.selectTableRow('demo', false);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that a role is selected for moving to next step', () => {
    cy.contains(/^Select a resource type$/);
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="namespace"]').click();
    cy.clickButton(/^Next$/);
    cy.contains(/^Select namespaces$/);
    cy.selectTableRow('demo', false);
    cy.clickButton(/^Next$/);
    cy.contains(/^Select roles to apply to all of your selected namespaces.$/);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_namespace_owner', {
      disableFilter: true,
    });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected resources and roles in the Review step', () => {
    cy.contains(/^Select a resource type$/);
    cy.get('div[data-cy="resourcetype-form-group"] button').click();
    cy.get('button[data-cy="namespace"]').click();
    cy.clickButton(/^Next$/);
    cy.contains(/^Select namespaces$/);
    cy.selectTableRow('demo', false);
    cy.clickButton(/^Next$/);
    cy.contains(/^Select roles to apply to all of your selected namespaces.$/);
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_namespace_owner', {
      disableFilter: true,
    });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.hasDetail(/^Resource type$/, 'Namespace');
    cy.get('[data-cy="expandable-section-resources"]').should('contain.text', 'Resources');
    cy.get('[data-cy="expandable-section-resources"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-resources"]').should('contain.text', 'demo');
    cy.get('[data-cy="expandable-section-hubRoles"]').should('contain.text', 'Roles');
    cy.get('[data-cy="expandable-section-hubRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-hubRoles"]').should(
      'contain.text',
      'galaxy.collection_namespace_owner'
    );
    cy.get('[data-cy="expandable-section-hubRoles"]').should(
      'contain.text',
      'Change and upload collections to namespaces.'
    );
  });
});
