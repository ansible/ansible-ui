import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import mockHubCustomRole from '../../../../../cypress/fixtures/hubCustomRoleDefinition.json';
import { CreateRole, EditRole } from './HubRoleForm';
import { hubAPI } from '../../../common/api/formatPath';

describe('HubRoleForm', () => {
  describe('Create Role', () => {
    it('Validates required fields', () => {
      cy.mountHub(<CreateRole />);
      cy.clickButton(/^Create role$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Content type is required.').should('be.visible');
      cy.get('[data-cy="name"]').type('galaxy.test_custom_role');
      cy.selectDropdownOptionByResourceName('content-type', 'Ansible Repository');
      cy.clickButton(/^Create role$/);
      cy.contains('Permissions is required.').should('be.visible');
    });
    it('Sends the correct payload when creating a new role', () => {
      cy.intercept('POST', hubAPI`/_ui/v2/role_definitions/`, {
        statusCode: 201,
        fixture: 'hubCustomRoleDefinition.json',
      }).as('createRole');
      cy.mountHub(<CreateRole />);
      cy.get('[data-cy="name"]').type('galaxy.test_custom_role');
      cy.get('[data-cy="description"]').type('View repository');
      cy.selectDropdownOptionByResourceName('content-type', 'Ansible Repository');
      cy.get('#permissions').click();
      cy.selectMultiSelectOption('#permissions-select', 'View Ansible repository');
      cy.clickButton(/^Create role$/);
      cy.wait('@createRole')
        .its('request.body')
        .then((editedRole: HubRbacRole) => {
          expect(editedRole.name).to.equal('galaxy.test_custom_role');
          expect(editedRole.description).to.equal('View repository');
          expect(editedRole.content_type).to.equal('galaxy.ansiblerepository');
          expect(editedRole.permissions).to.deep.equal(['galaxy.view_ansiblerepository']);
        });
    });
    it('Submit error message on internal server error', () => {
      cy.mountHub(<CreateRole />);
      cy.get('[data-cy="name"]').type('galaxy.test_custom_role');
      cy.get('[data-cy="description"]').type('View repository');
      cy.selectDropdownOptionByResourceName('content-type', 'Ansible Repository');
      cy.get('#permissions').click();
      cy.selectMultiSelectOption('#permissions-select', 'View Ansible repository');
      cy.intercept(
        { method: 'POST', url: hubAPI`/_ui/v2/role_definitions/` },
        { statusCode: 500, message: 'Internal Server Error' }
      );
      cy.clickButton(/^Create role$/);
      cy.contains('Internal Server Error').should('be.visible');
    });
  });
  describe('Edit Role', () => {
    it('Successfully loads data and edits the role', () => {
      cy.intercept({ method: 'GET', url: hubAPI`/_ui/v2/role_definitions/1/` }, mockHubCustomRole);
      const path = '/roles/:id/edit';
      const initialEntries = ['/roles/1/edit'];
      const params = {
        path,
        initialEntries,
      };
      cy.intercept('PATCH', hubAPI`/_ui/v2/role_definitions/1/`, {
        statusCode: 201,
        fixture: 'hubCustomRoleDefinition.json',
      }).as('editRole');
      cy.mount(<EditRole />, params);
      cy.get('[data-cy="name"]').should('have.value', mockHubCustomRole.name);
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('galaxy.edited_role');
      cy.get('[data-cy="description"]').should('have.value', mockHubCustomRole.description);
      cy.get('[data-cy="description"]').clear();
      cy.get('[data-cy="description"]').type('Edited Description');
      cy.get('[data-cy="content-type-form-group"]').contains('Ansible Repository');
      cy.get('[data-cy="content-type-form-group"]')
        .should('be.visible')
        .within(() => {
          cy.get('button').should('be.visible').should('be.disabled');
        });
      cy.multiSelectShouldHaveSelectedOption('#permissions', 'View Ansible repository');
      cy.get('#permissions').click();
      cy.selectMultiSelectOption('#permissions-select', 'Change Ansible repository');
      cy.clickButton(/^Save role$/);
      cy.wait('@editRole')
        .its('request.body')
        .then((editedRole: HubRbacRole) => {
          expect(editedRole.name).to.equal('galaxy.edited_role');
          expect(editedRole.description).to.equal('Edited Description');
          expect(editedRole.content_type).to.equal('galaxy.ansiblerepository');
          expect(editedRole.permissions).to.deep.equal([
            'galaxy.view_ansiblerepository',
            'galaxy.change_ansiblerepository',
          ]);
        });
    });
  });
});
