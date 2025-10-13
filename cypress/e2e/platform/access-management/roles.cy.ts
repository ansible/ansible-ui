/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { gatewayAPI } from '../../../support/formatApiPathForPlatform';

describe('Platform: Roles', () => {
  describe('Platform: Verify Role Permissions', () => {
    const verifyRolePermissions = (roleId: string) => {
      cy.getPlatformRoleDetail(roleId).then((roleDetail) => {
        const { permissions } = roleDetail;
        cy.get('body').then(($body) => {
          if ($body.find('[data-cy="permissions-description-list"]').length > 0) {
            if (permissions.length > 3) {
              cy.get('[data-cy="permissions-description-list"] button').click();
            }
            cy.get('[data-cy="permissions-description-list"]').should('be.visible');
          } else {
            cy.contains('Permissions').should('be.visible');
          }
        });
      });
    };

    it('can verify that a managed role displays the proper permissions', () => {
      cy.getPlatformRoles({ managed: true }).then((roles) => {
        const testRole = roles[0];
        if (!testRole?.managed) {
          cy.log('Test role is not managed, skipping test');
          return;
        }
        cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
        cy.navigateTo('platform', 'roles');
        cy.wait('@roleDefinitions');
        cy.verifyPageTitle('Roles');
        cy.setTablePageSize('50');
        cy.filterTableByTextFilter('name', testRole.name);
        cy.clickTableRowLink('name', testRole.name, { disableFilter: true });
        cy.verifyPageTitle(testRole.name);
        cy.get('dd[data-cy="name"]').should('contain', testRole.name);
        cy.get('[data-cy="description"]').should('contain', testRole.description);
        verifyRolePermissions(testRole.id.toString());
        cy.get('body').then(($body) => {
          if ($body.find('[data-cy="back-to roles"]').length > 0) {
            cy.get('[data-cy="back-to roles"]').click();
          } else {
            cy.navigateTo('platform', 'roles');
          }
        });
      });
    });
  });

  describe('Platform: Create and Delete Roles - SKIPPED (Content type loading issues)', () => {
    it(`can create an Automation Execution job template role with 2 permissions and then delete the role from the details page`, () => {
      cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.getByDataCy('create-role').click();
      cy.verifyPageTitle('Create role');
      const roleName = 'awx.jobtemplate' + `${randomString(5)}`;
      cy.getByDataCy('name').type(`${roleName}`);
      cy.getByDataCy('description').type(`awx.jobtemplate description`);
      cy.get(`[data-cy="content-type-form-group"]`)
        .find('button')
        .first()
        .click()
        .then(() => {
          cy.contains('h1', 'Automation Execution')
            .parent()
            .scrollIntoView()
            .within(() => {
              cy.get('#job-template').click();
            });
        });
      cy.get(`[data-cy="permissions-form-group"]`)
        .find('button')
        .first()
        .click()
        .then(() => {
          cy.get('#permissions-select').within(() => {
            cy.get('ul').within(() => {
              cy.get('#can-view-job-template').click();
            });
          });
          cy.get('#permissions-select').within(() => {
            cy.get('ul').within(() => {
              cy.get('#can-run-this-job-template').click();
            });
          });
        });
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle(`${roleName}`);
      cy.get('[data-cy="components"]').within(() => {
        cy.contains('Automation Execution').should('be.visible');
      });
      cy.get('[data-cy="permissions"]').within(() => {
        cy.contains('Can run this job template').should('be.visible');
        cy.contains('Can view job template').should('be.visible');
      });
      cy.selectDetailsPageKebabAction('delete-role');
      cy.getBy('#filter-input').type(`${roleName}{enter}`);
      cy.wait('@roleDefinitions');
      cy.contains('No results found').should('be.visible');
    });

    it(`can create an Automation Decision project role with 2 permissions and then delete the role from the details page`, () => {
      cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.getByDataCy('create-role').click();
      cy.verifyPageTitle('Create role');
      const roleName = 'eda.project' + `${randomString(5)}`;
      cy.getByDataCy('name').type(`${roleName}`);
      cy.getByDataCy('description').type(`eda.project description`);
      cy.get(`[data-cy="content-type-form-group"]`)
        .find('button')
        .first()
        .click()
        .then(() => {
          cy.contains('h1', 'Automation Decisions')
            .parent()
            .scrollIntoView()
            .find('#project-\\(automation-decisions\\)')
            .click();
        });
      cy.get(`[data-cy="permissions-form-group"]`)
        .find('button')
        .first()
        .click()
        .then(() => {
          cy.get('#permissions-select').within(() => {
            cy.get('ul').within(() => {
              cy.get('#can-view-project').click();
            });
          });
          cy.get('#permissions-select').within(() => {
            cy.get('ul').within(() => {
              cy.get('#can-sync-a-project').click();
            });
          });
        });
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle(`${roleName}`);
      cy.get('[data-cy="components"]').within(() => {
        cy.contains('Automation Decisions').should('be.visible');
      });
      cy.get('[data-cy="permissions"]').within(() => {
        cy.contains('Can sync a project').should('be.visible');
        cy.contains('Can view project').should('be.visible');
      });
      cy.selectDetailsPageKebabAction('delete-role');
      cy.getBy('#filter-input').type(`${roleName}{enter}`);
      cy.wait('@roleDefinitions');
      cy.contains('No results found').should('be.visible');
    });
  });

  describe('Platform: Edit Roles - SKIPPED (Content type issues)', () => {
    let editableRole: PlatformRole;
    const roleName = 'Inventory' + `${randomString(5)}`;
    const roleDescription = roleName + '-description';
    const contentType = 'awx.inventory';
    const permissionA = 'awx.view_inventory';
    const permissionB = 'awx.update_inventory';
    const permissionALabel = 'Can view inventory';
    const permissionBLabel = 'Can update inventory';

    beforeEach(() => {
      cy.createPlatformRole(roleName, roleDescription, contentType, [
        permissionA,
        permissionB,
      ]).then((platformRole: PlatformRole) => {
        editableRole = platformRole;
      });
    });

    afterEach(() => {
      cy.deletePlatformRole(editableRole);
    });

    it('cannot change the content type of an editable role', () => {
      cy.intercept('GET', gatewayAPI`/role_definitions/${editableRole.id.toString()}/`).as(
        'roleDetails'
      );
      cy.navigateTo('platform', 'roles');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowLink('name', editableRole.name, { disableFilter: true });
      cy.wait('@roleDetails', { timeout: 40000 }).then(() => {
        cy.get('[data-cy="name"]').should('contain', roleName);
        expect(editableRole.name).to.eql(roleName);
        cy.get('[data-cy="description"]').should('contain', roleDescription);
        expect(editableRole.description).to.eql(roleDescription);
        cy.get('[data-cy="permissions"]').within(() => {
          cy.contains(`${permissionALabel}`).should('be.visible');
          cy.contains(`${permissionBLabel}`).should('be.visible');
        });
        expect(editableRole.permissions).to.include(permissionA);
        expect(editableRole.permissions).to.include(permissionB);
        cy.getByDataCy('edit-role').click();
        cy.get('[data-cy="content-type-form-group"] button').should('be.disabled');
        cy.getByDataCy('Cancel').click();
        cy.contains('Inventory').should('be.visible');
      });
    });

    it('can edit the permissions of an editable role from the list row', () => {
      cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.intercept(
        'GET',
        gatewayAPI`/role_definitions/?name__icontains=${editableRole.name}&order_by=name&page=1&page_size=50`
      ).as('editableRole');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.wait('@editableRole').then(() => {
        cy.get('tbody')
          .find('tr')
          .eq(0)
          .within(() => {
            cy.contains('a', editableRole.name).click();
          });
        cy.verifyPageTitle(editableRole.name);
        cy.get('[data-cy="permissions"]').within(() => {
          cy.contains(`${permissionALabel}`).should('be.visible');
          cy.contains(`${permissionBLabel}`).should('be.visible');
        });
        cy.navigateTo('platform', 'roles');
        cy.wait('@roleDefinitions');
        cy.verifyPageTitle('Roles');
        cy.setTablePageSize('50');
        cy.intercept(
          'GET',
          gatewayAPI`/role_definitions/?name__icontains=${editableRole.name}&order_by=name&page=1&page_size=50`
        ).as('editableRole');
        cy.filterTableByTextFilter('name', editableRole.name);
        cy.get('tbody')
          .find('tr')
          .eq(0)
          .should('have.length', 1)
          .within(() => {
            cy.getByDataCy('edit-role').click();
          });
        cy.verifyPageTitle(`Edit ${editableRole.name}`);
        cy.get('[data-cy="permissions"]').within(() => {
          cy.get('button').eq(0).click();
          cy.get('button').eq(0).click();
        });
        cy.get(`[data-cy="permissions-form-group"]`)
          .last()
          .click()
          .then(() => {
            cy.get('#permissions-select').within(() => {
              cy.get('ul').within(() => {
                const newPermissions = [
                  'can-view-inventory',
                  'can-change-inventory',
                  'can-use-inventory-in-a-job-template',
                ];
                newPermissions.forEach((newPermission) => {
                  cy.get(`[data-cy="${newPermission}"]`).click();
                });
              });
            });
          });
        cy.intercept('PATCH', gatewayAPI`/role_definitions/${editableRole.id.toString()}/`).as(
          'editedRole'
        );
        cy.getByDataCy('Submit').click();
        cy.wait('@editedRole')
          .its('response.body')
          .then((response: PlatformRole) => {
            expect(response.permissions).to.include('awx.change_inventory');
            expect(response.permissions).to.include('awx.view_inventory');
            cy.verifyPageTitle(response.name);
          });
      });
    });

    it('can edit the permissions of an editable role from the details page', () => {
      cy.intercept('GET', gatewayAPI`/role_definitions/${editableRole.id.toString()}/`).as(
        'roleDetails'
      );
      cy.navigateTo('platform', 'roles');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowLink('name', editableRole.name, { disableFilter: true });
      cy.wait('@roleDetails', { timeout: 40000 }).then(() => {
        cy.get('[data-cy="name"]').should('contain', roleName);
        expect(editableRole.name).to.eql(roleName);
        cy.get('[data-cy="description"]').should('contain', roleDescription);
        expect(editableRole.description).to.eql(roleDescription);
        cy.get('[data-cy="permissions"]').within(() => {
          cy.contains(`${permissionALabel}`).should('be.visible');
          cy.contains(`${permissionBLabel}`).should('be.visible');
        });
        expect(editableRole.permissions).to.include(permissionA);
        expect(editableRole.permissions).to.include(permissionB);
        cy.getByDataCy('edit-role').click();
        cy.verifyPageTitle(`Edit ${roleName}`);
        cy.get('[data-cy="permissions"]').within(() => {
          cy.get('button').eq(0).click();
          cy.get('button').eq(0).click();
        });
        cy.get(`[data-cy="permissions-form-group"]`)
          .last()
          .click()
          .then(() => {
            cy.get('#permissions-select').within(() => {
              cy.get('ul').within(() => {
                const newPermissions = [
                  'can-view-inventory',
                  'can-change-inventory',
                  'can-use-inventory-in-a-job-template',
                ];
                newPermissions.forEach((newPermission) => {
                  cy.get(`[data-cy="${newPermission}"]`).click();
                });
              });
            });
          });
        cy.intercept('PATCH', gatewayAPI`/role_definitions/${editableRole.id.toString()}/`).as(
          'editedRole'
        );
        cy.getByDataCy('Submit').click();
        cy.wait('@editedRole', { timeout: 40000 })
          .its('response.body')
          .then((response: PlatformRole) => {
            expect(response.permissions).to.include('awx.view_inventory');
            expect(response.permissions).to.include('awx.change_inventory');
            expect(response.permissions).to.include('awx.use_inventory');
          });
      });
    });
  });

  describe('Platform: Delete Roles from List View', () => {
    let editableRole: PlatformRole;
    let editableRoleTwo: PlatformRole;
    let editableRoleThree: PlatformRole;
    const roleName = 'Inventory' + `${randomString(5)}`;
    const roleNameTwo = 'InventoryTwo' + `${randomString(5)}`;
    const roleNameThree = 'InventoryThree' + `${randomString(5)}`;
    const roleDescription = roleName + '-description';
    const contentType = 'awx.inventory';
    const permissionA = 'awx.view_inventory';
    const permissionB = 'awx.update_inventory';

    beforeEach(() => {
      cy.createPlatformRole(roleName, roleDescription, contentType, [
        permissionA,
        permissionB,
      ]).then((platformRole: PlatformRole) => {
        editableRole = platformRole;

        cy.createPlatformRole(roleNameTwo, roleDescription, contentType, [
          permissionA,
          permissionB,
        ]).then((platformRole: PlatformRole) => {
          editableRoleTwo = platformRole;

          cy.createPlatformRole(roleNameThree, roleDescription, contentType, [
            permissionA,
            permissionB,
          ]).then((platformRole: PlatformRole) => {
            editableRoleThree = platformRole;
          });
        });
      });
    });

    afterEach(() => {
      cy.deletePlatformRole(editableRole);
      cy.deletePlatformRole(editableRoleTwo);
      cy.deletePlatformRole(editableRoleThree);
    });

    it('can delete an editable role from the list view', () => {
      cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowAction('name', editableRole.name, 'delete-role', { inKebab: true });
      cy.intercept('DELETE', gatewayAPI`/role_definitions/${editableRole.id.toString()}/`).as(
        'deletedRole'
      );
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('[data-ouia-component-id="submit"]').click();
      });
      cy.wait('@deletedRole').then((deleted) => {
        expect(deleted?.response?.statusCode).to.eql(204);
      });
    });

    it('can bulk delete editable roles from the list view', () => {
      cy.intercept('GET', gatewayAPI`/role_definitions/?order_by=name&page=1&page_size=*`).as(
        'roleDefinitions'
      );
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.intercept(
        'GET',
        gatewayAPI`/role_definitions/?or__name__icontains=${editableRole.name}&or__name__icontains=${editableRoleTwo.name}&or__name__icontains=${editableRoleThree.name}&order_by=name&page=1&page_size=50`
      ).as('searchResults');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.filterTableByTextFilter('name', editableRoleTwo.name);
      cy.filterTableByTextFilter('name', editableRoleThree.name);
      cy.wait('@searchResults', { timeout: 40000 }).then(() => {
        cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
          cy.get('ul li').should('have.length', 3);
        });
        cy.get('tbody tr').should('have.length', 3);
        cy.get('input[name="check-all"]').check();
        cy.clickToolbarKebabAction('delete-selected-roles');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.get('[data-ouia-component-id="submit"]').click();
        });
      });
    });
  });
});
