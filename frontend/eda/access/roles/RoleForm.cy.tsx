import { CreateRole, EditRole } from './RoleForm';
import mockEdaCustomRole from '../../../../cypress/fixtures/edaCustomRoleDefinition.json';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';

describe('RoleForm', () => {
  describe('Create Role', () => {
    it('Validates required fields', () => {
      cy.mountEda(<CreateRole />);
      cy.clickButton(/^Create role$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Content type is required.').should('be.visible');
      cy.get('[data-cy="name"]').type('Test Role');
      cy.selectDropdownOptionByResourceName('content-type', 'Activation');
      cy.clickButton(/^Create role$/);
      cy.contains('Permissions is required.').should('be.visible');
    });
    it('Sends the correct payload when creating a new role', () => {
      cy.intercept('POST', '/api/eda/v1/role_definitions/', {
        statusCode: 201,
        fixture: 'edaCustomRoleDefinition.json',
      }).as('createRole');
      cy.mount(<CreateRole />);
      cy.get('[data-cy="name"]').type('View activation');
      cy.get('[data-cy="description"]').type('A user can view activations with this role');
      cy.selectDropdownOptionByResourceName('content-type', 'Activation');
      cy.get('#permissions').click();
      cy.selectMultiSelectOption('#permissions-select', 'View activation');
      cy.clickButton(/^Create role$/);
      cy.wait('@createRole')
        .its('request.body')
        .then((editedRole: EdaRbacRole) => {
          expect(editedRole.name).to.equal('View activation');
          expect(editedRole.description).to.equal('A user can view activations with this role');
          expect(editedRole.content_type).to.equal('eda.activation');
          expect(editedRole.permissions).to.deep.equal(['eda.view_activation']);
        });
    });
    it('Submit error message on internal server error', () => {
      cy.mountEda(<CreateRole />);
      cy.get('[data-cy="name"]').type('View activation');
      cy.get('[data-cy="description"]').type('A user can view activations with this role');
      cy.selectDropdownOptionByResourceName('content-type', 'Activation');
      cy.get('#permissions').click();
      cy.selectMultiSelectOption('#permissions-select', 'View');
      cy.intercept(
        { method: 'POST', url: '/api/eda/v1/role_definitions' },
        { statusCode: 500, message: 'Internal Server Error' }
      );
      cy.clickButton(/^Create role$/);
      cy.contains('Internal Server Error').should('be.visible');
    });
  });
  describe('Edit Role', () => {
    it('Successfully loads data and edits the role', () => {
      cy.intercept({ method: 'GET', url: '/api/eda/v1/role_definitions/*' }, mockEdaCustomRole);
      cy.intercept('PATCH', '/api/eda/v1/role_definitions/*', {
        statusCode: 201,
        fixture: 'edaCustomRoleDefinition.json',
      }).as('editRole');
      cy.mount(<EditRole />);
      cy.get('[data-cy="name"]').should('have.value', mockEdaCustomRole.name);
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Edited Role');
      cy.get('[data-cy="description"]').should('have.value', mockEdaCustomRole.description);
      cy.get('[data-cy="description"]').clear();
      cy.get('[data-cy="description"]').type('Edited Description');
      cy.get('[data-cy="content-type-form-group"]').contains('Project');
      cy.get('[data-cy="content-type-form-group"]')
        .should('be.visible')
        .within(() => {
          cy.get('button').should('be.visible').should('be.disabled');
        });
      cy.multiSelectShouldHaveSelectedOption('#permissions', 'View project');
      cy.get('#permissions').click();
      cy.selectMultiSelectOption('#permissions-select', 'Change');
      cy.clickButton(/^Save role$/);
      cy.wait('@editRole')
        .its('request.body')
        .then((editedRole: EdaRbacRole) => {
          expect(editedRole.name).to.equal('Edited Role');
          expect(editedRole.description).to.equal('Edited Description');
          expect(editedRole.content_type).to.equal('eda.project');
          expect(editedRole.permissions).to.deep.equal(['eda.view_project', 'eda.change_project']);
        });
    });
  });
});
