import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { HubRbacRole } from '@ansible/hub-ui/interfaces/expanded/HubRbacRole';

describe('Automation Content: Roles', () => {
  describe('Automation Content: : Create and Delete Roles from Details View', () => {
    const roleTypes = [
      {
        role: 'galaxy.namespace',
        type: 'namespace',
        rolePermission: ['add-collection-import'],
      },
      {
        role: 'galaxy.system',
        type: 'system',
        rolePermission: ['add-collection-remote'],
      },
    ];

    roleTypes.forEach((roleType) => {
      it(`can create ${roleType.role} role with 1 permissions and then delete the role from the details page`, () => {
        cy.navigateTo('platform', 'roles');
        cy.verifyPageTitle('Roles');
        cy.clickTab(/^Automation Content$/, true);
        cy.setTablePageSize('50');
        cy.getByDataCy('create-role').click();
        cy.verifyPageTitle('Create role');
        const roleName = `${roleType.role}` + `${randomString(4)}`;
        cy.getByDataCy('name').type(`${roleName}`);
        cy.getByDataCy('description').type(`${roleType.role} description`);
        cy.get(`[data-cy="content-type-form-group"]`)
          .find('button')
          .first()
          .click()
          .then(() => {
            cy.get('#content-type').within(() => {
              cy.get(`li[data-cy="${roleType.type}"]`).click();
            });
          });
        const permissions = roleType.rolePermission;
        cy.get(`[data-cy="permissions-form-group"]`)
          .click()
          .then(() => {
            cy.get('#permissions-select').within(() => {
              cy.get('ul').within(() => {
                permissions.forEach((permission) => {
                  cy.get(`li[data-cy="${permission}"]`).click();
                });
              });
            });
          });
        cy.getByDataCy('Submit').click();
        cy.verifyPageTitle(`${roleName}`);
        cy.clickTab('Details', true);
        cy.verifyPageTitle(`${roleName}`);
        cy.url().should('contain', '/details');
        cy.contains(`${roleType.role} description`);
        cy.selectDetailsPageKebabAction('delete-role');
      });
    });
  });

  describe('Automation Content: Edit Role and its Permissions', () => {
    let editableRole: HubRbacRole;
    const role = {
      roleName: 'galaxy.' + `${randomString(5)}`,
      roleDescription: 'description',
      contentType: ContentTypeEnum.Namespace,
      permission: 'galaxy.view_namespace',
    };
    before(() => {
      cy.createHubRoleAPI({
        roleName: role.roleName,
        description: role.roleDescription,
        content_type: ContentTypeEnum.Namespace,
        permissions: [role.permission],
      }).then((createdRole) => {
        editableRole = createdRole;
      });
    });
    beforeEach(() => {
      cy.navigateTo('platform', 'roles');
      cy.verifyPageTitle('Roles');
      cy.clickTab(/^Automation Content$/, true);
    });

    after(() => {
      cy.deleteHubRoleAPI(editableRole);
    });

    it('cannot change the content type of an editable role', () => {
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowLink('name', editableRole.name, { disableFilter: true });
      cy.verifyPageTitle(editableRole.name);
      cy.getByDataCy('edit-role').click();
      cy.get('[data-cy="content-type-form-group"] button').should('be.disabled');
      cy.getByDataCy('Cancel').click();
    });

    it('can edit the permissions of an editable role from the list row', () => {
      cy.clickTableRowPinnedAction(editableRole.name, 'edit-role');
      cy.verifyPageTitle(`Edit ${editableRole.name}`);
      cy.multiSelectByDataCy('permissions', ['Change namespace']);
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle('Roles');
      cy.clickLink(editableRole.name);
      cy.verifyPageTitle(editableRole.name);
      cy.getByDataCy('permissions').within(() => {
        cy.get('.pf-v5-c-description-list__description').within(() => {
          cy.get('[data-cy="galaxy.change_namespace"]').should('contain.text', 'Change namespace');
          cy.get('[data-cy="galaxy.view_namespace"]').should('contain.text', 'View namespace');
        });
      });
    });

    it('can edit the permissions of an editable role from the details page', () => {
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowLink('name', editableRole.name, { disableFilter: true });
      cy.verifyPageTitle(editableRole.name);
      cy.clickButton('Edit role');
      cy.verifyPageTitle(`Edit ${editableRole.name}`);
      cy.multiSelectByDataCy('permissions', ['Delete namespace', 'Change namespace']);
      cy.getByDataCy('Submit').click();
      cy.getByDataCy('permissions').within(() => {
        cy.get('.pf-v5-c-description-list__description').within(() => {
          cy.get('[data-cy="galaxy.view_namespace"]').should('contain.text', 'View namespace');
          cy.get('[data-cy="galaxy.change_namespace"]').should('contain.text', 'Change namespace');
          cy.get('[data-cy="galaxy.delete_namespace"]').should('contain.text', 'Delete namespace');
        });
      });
    });
  });

  describe('Automation Content: Create and Delete Roles from List View', () => {
    let editableRole: HubRbacRole;
    const role = {
      roleName: 'galaxy.' + `${randomString(5)}`,
      roleDescription: 'description',
      contentType: ContentTypeEnum.Namespace,
    };

    const permissions = [
      'galaxy.add_collectionimport',
      'galaxy.change_collectionimport',
      'galaxy.delete_collectionimport',
      'galaxy.view_collectionimport',
      'galaxy.change_namespace',
      'galaxy.delete_namespace',
      'galaxy.upload_to_namespace',
      'galaxy.view_namespace',
    ];

    beforeEach(() => {
      cy.createHubRoleAPI({
        roleName: role.roleName,
        description: role.roleDescription,
        content_type: ContentTypeEnum.Namespace,
        permissions: permissions,
      }).then((createdRole: HubRbacRole) => {
        editableRole = createdRole;
      });
      cy.navigateTo('platform', 'roles');
      cy.verifyPageTitle('Roles');
      cy.clickTab(/^Automation Content$/, true);
    });

    it('can delete an editable role from the list view', () => {
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getBy(`[data-cy="actions-dropdown"]`).click();
      });
      cy.getBy('[data-cy="delete-role"]').click();
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete role/);
        cy.contains(/^Success$/);
      });
      cy.clickButton(/^Clear all filters$/);
    });
  });

  describe('Automation Content: Create and Bulk Delete Roles from Toolbar View', () => {
    let editableRole1: HubRbacRole;
    let editableRole2: HubRbacRole;

    const role1 = {
      roleName: 'galaxy.' + `${randomString(5)}`,
      roleDescription: 'description',
      contentType: ContentTypeEnum.CollectionRemote,
      permission: 'galaxy.view_collectionremote',
    };

    const role2 = {
      roleName: 'galaxy.' + `${randomString(5)}`,
      roleDescription: 'description',
      contentType: ContentTypeEnum.CollectionRemote,
      permission: 'galaxy.view_collectionremote',
    };

    beforeEach(() => {
      cy.createHubRoleAPI({
        roleName: role1.roleName,
        description: role1.roleDescription,
        content_type: ContentTypeEnum.CollectionRemote,
        permissions: [role1.permission],
      }).then((createdRole: HubRbacRole) => {
        editableRole1 = createdRole;
      });

      cy.createHubRoleAPI({
        roleName: role2.roleName,
        description: role2.roleDescription,
        content_type: ContentTypeEnum.CollectionRemote,
        permissions: [role2.permission],
      }).then((createdRole: HubRbacRole) => {
        editableRole2 = createdRole;
      });

      cy.navigateTo('platform', 'roles');
      cy.verifyPageTitle('Roles');
      cy.clickTab(/^Automation Content$/, true);
    });

    after(() => {
      cy.deleteHubRoleAPI(editableRole1);
      cy.deleteHubRoleAPI(editableRole2);
    });

    it('can bulk delete editable roles from the toolbar view', () => {
      cy.filterTableByTextFilter('name', editableRole1.name);
      cy.contains('tr', editableRole1.name).within(() => {
        cy.get('input[type=checkbox]').click();
      });
      cy.filterTableByTextFilter('name', editableRole2.name);
      cy.contains('tr', editableRole2.name).within(() => {
        cy.get('input[type=checkbox]').click();
      });
      cy.clickToolbarKebabAction('delete-roles');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete roles/);
        cy.contains(/^Success$/);
      });
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
