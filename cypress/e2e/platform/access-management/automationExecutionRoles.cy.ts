import { randomString } from '../../../../framework/utils/random-string';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { AwxRbacRole } from '../../../../frontend/awx/interfaces/AwxRbacRole';

describe('Automation Execution: Roles', () => {
  describe('Automation Execution: Verify Role Permissions', () => {
    it(`can verify that a managed Automation Execution role displays the proper permissions`, () => {
      cy.getAwxRoles({ managed: true })
        .its('results')
        .then((roles) => {
          const testRole = roles[17];
          cy.intercept('GET', awxAPI`/role_definitions/*`).as('roleDefinitions');
          cy.navigateTo('platform', 'roles');
          cy.wait('@roleDefinitions');
          cy.verifyPageTitle('Roles');
          cy.setTablePageSize('50');
          if (testRole.managed === true) {
            cy.get('[data-ouia-component-id="simple-table"]').within(() => {
              cy.get(`[data-cy="row-id-${testRole.id}"]`)
                .scrollIntoView()
                .should('be.visible')
                .within(() => {
                  cy.contains(`${testRole.name}`).should('be.visible');
                  cy.getByDataCy('expand-column-cell').click();
                });
              cy.wait('@roleDefinitions');
              cy.getAwxRoleDetail(testRole.id.toString()).then((roleDetail) => {
                if (roleDetail.permissions.length > 3) {
                  cy.get('[data-cy="permissions-description-list"] button').click();
                }
                const roleDetailPermissions = roleDetail.permissions;
                roleDetailPermissions.forEach((detail) => {
                  cy.get(`[data-cy="${JSON.parse(JSON.stringify(detail))}"]`).should('be.visible');
                });
              });
              cy.get(`[data-cy="row-id-${testRole.id}"]`).within(() => {
                cy.contains(`${testRole.name}`).click();
              });
            });
            cy.verifyPageTitle(`${testRole.name}`);
            cy.get(`dd[data-cy="name"]`).should('contain', `${testRole.name}`);
            cy.get(`[data-cy="description"]`).should('contain', `${testRole.description}`);
            cy.getAwxRoleDetail(testRole.id.toString()).then((roleDetail) => {
              if (roleDetail.permissions.length > 3) {
                cy.get('[data-cy="permissions-description-list"] button').click();
              }
              const roleDetailPermissions = roleDetail.permissions;
              roleDetailPermissions.forEach((detail) => {
                cy.get(`[data-cy="${JSON.parse(JSON.stringify(detail))}"]`).should('be.visible');
              });
            });
            cy.get('[data-cy="back-to automation execution roles"]').click();
          }
        });
    });
  });

  describe('Automation Execution: Create and Delete Roles', () => {
    const roleTypes = [
      { role: 'Job template', rolePermission: ['view-job-template', 'execute-job-template'] },
      { role: 'Project', rolePermission: ['view-project', 'update-project'] },
    ];

    roleTypes.forEach((roleType) => {
      it(`can create ${roleType.role} role with 2 permissions and then delete the role from the details page`, () => {
        cy.intercept('GET', awxAPI`/role_definitions/*`).as('roleDefinitions');
        cy.navigateTo('platform', 'roles');
        cy.wait('@roleDefinitions');
        cy.verifyPageTitle('Roles');
        cy.setTablePageSize('50');
        cy.getByDataCy('create-role').click();
        cy.verifyPageTitle('Create Role');
        const roleName = `${roleType.role}` + `${randomString(5)}`;
        cy.getByDataCy('name').type(`${roleName}`);
        cy.getByDataCy('description').type(`${roleType.role} description`);
        cy.get(`[data-cy="content-type-form-group"]`)
          .click()
          .within(() => {
            cy.contains('li', `${roleType.role}`).click();
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
        cy.clickTab('Details', true); //this line can be removed when https://issues.redhat.com/browse/AAP-25014 is fixed
        cy.url().should('contain', '/details');
        cy.selectDetailsPageKebabAction('delete-role');
        cy.getBy('#filter-input').type(`${roleName}{enter}`);
        cy.wait(2000);
      });
    });
  });

  describe('Automation Execution: Edit Roles', () => {
    let editableRole: AwxRbacRole;
    const roleName = 'Inventory' + `${randomString(5)}`;
    const roleDescription = roleName + '-description';
    const contentType = 'inventory';
    const permissionA = 'awx.view_inventory';
    const permissionB = 'awx.update_inventory';

    beforeEach(() => {
      cy.createAwxRole(roleName, roleDescription, contentType, [permissionA, permissionB]).then(
        (awxRole: AwxRbacRole) => {
          editableRole = awxRole;
        }
      );
    });

    afterEach(() => {
      cy.deleteAwxRole(editableRole);
    });

    it('cannot change the content type of an editable role', () => {
      cy.intercept('GET', awxAPI`/role_definitions/${editableRole.id.toString()}/`).as(
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
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionA))}"]`).should('be.visible');
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionB))}"]`).should('be.visible');
        expect(editableRole.permissions).to.include(permissionA);
        expect(editableRole.permissions).to.include(permissionB);
        cy.getByDataCy('edit-role').click();
        cy.get('[data-cy="content-type-form-group"] button').should('be.disabled');
        cy.getByDataCy('Cancel').click();
        cy.getByDataCy('awx.inventory').should('contain', 'Inventory');
      });
    });

    it('can edit the permissions of an editable role from the list row', () => {
      cy.intercept('GET', awxAPI`/role_definitions/*`).as('roleDefinitions');
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.intercept(
        'GET',
        awxAPI`/role_definitions/?name__icontains=${editableRole.name}&order_by=name&page=1&page_size=50`
      ).as('editableRole');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.wait('@editableRole').then(() => {
        cy.get('tbody tr')
          .should('have.length', 1)
          .within(() => {
            cy.getByDataCy('expand-column-cell').click();
          });
        cy.get('tbody')
          .find('tr')
          .eq(1)
          .within(() => {
            cy.get('[data-cy="permissions-description-list"]').within(() => {
              const oldPermissions = ['awx.view_inventory', 'awx.update_inventory'];
              oldPermissions.forEach((oldPermission) => {
                cy.get(`[data-cy="${oldPermission}"]`).should('be.visible');
              });
            });
          });
        cy.get('tbody')
          .find('tr')
          .eq(0)
          .should('have.length', 1)
          .within(() => {
            cy.getByDataCy('edit-role').click();
          });
        cy.verifyPageTitle('Edit Role');
        cy.get(`[data-cy="permissions-form-group"]`)
          .click()
          .then(() => {
            cy.get('#permissions-select').within(() => {
              cy.get('ul').within(() => {
                const newPermissions = ['update-inventory', 'use-inventory'];
                newPermissions.forEach((newPermission) => {
                  cy.get(`li[data-cy="${newPermission}"]`).click();
                });
              });
            });
          });
        cy.intercept('PATCH', awxAPI`/role_definitions/${editableRole.id.toString()}/`).as(
          'editedRole'
        );
        cy.getByDataCy('Submit').click();
        cy.wait('@editedRole')
          .its('response.body')
          .then((response: AwxRbacRole) => {
            expect(response.permissions).to.include('awx.use_inventory');
            expect(response.permissions).to.include('awx.view_inventory');
            cy.verifyPageTitle(response.name);
          });
      });
    });

    it('can edit the permissions of an editable role from the details page', () => {
      cy.intercept('GET', awxAPI`/role_definitions/${editableRole.id.toString()}/`).as(
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
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionA))}"]`).should('be.visible');
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionB))}"]`).should('be.visible');
        expect(editableRole.permissions).to.include(permissionA);
        expect(editableRole.permissions).to.include(permissionB);
        cy.getByDataCy('edit-role').click();
        cy.verifyPageTitle('Edit Role');
        cy.get(`[data-cy="permissions-form-group"]`)
          .click()
          .then(() => {
            cy.get('#permissions-select').within(() => {
              cy.get('ul').within(() => {
                const newPermissions = ['update-inventory', 'use-inventory'];
                newPermissions.forEach((newPermission) => {
                  cy.get(`li[data-cy="${newPermission}"]`).click();
                });
              });
            });
          });
        cy.intercept('PATCH', awxAPI`/role_definitions/${editableRole.id.toString()}/`).as(
          'editedRole'
        );
        cy.getByDataCy('Submit').click();
        cy.wait('@editedRole', { timeout: 40000 })
          .its('response.body')
          .then((response: AwxRbacRole) => {
            expect(response.permissions).to.include('awx.view_inventory');
            expect(response.permissions).to.include('awx.use_inventory');
            cy.get(`[data-cy="${JSON.parse(JSON.stringify('awx.view_inventory'))}"]`).should(
              'be.visible'
            );
            cy.get(`[data-cy="${JSON.parse(JSON.stringify('awx.use_inventory'))}"]`).should(
              'be.visible'
            );
            cy.url().should('contain', '/details');
          });
      });
    });
  });

  describe('Automation Execution: Delete Roles from List View', () => {
    let editableRole: AwxRbacRole;
    let editableRoleTwo: AwxRbacRole;
    let editableRoleThree: AwxRbacRole;
    const roleName = 'Inventory' + `${randomString(5)}`;
    const roleNameTwo = 'InventoryTwo' + `${randomString(5)}`;
    const roleNameThree = 'InventoryThree' + `${randomString(5)}`;
    const roleDescription = roleName + '-description';
    const contentType = 'inventory';
    const permissionA = 'awx.view_inventory';
    const permissionB = 'awx.update_inventory';

    beforeEach(() => {
      cy.createAwxRole(roleName, roleDescription, contentType, [permissionA, permissionB]).then(
        (awxRole: AwxRbacRole) => {
          editableRole = awxRole;

          cy.createAwxRole(roleNameTwo, roleDescription, contentType, [
            permissionA,
            permissionB,
          ]).then((awxRole: AwxRbacRole) => {
            editableRoleTwo = awxRole;

            cy.createAwxRole(roleNameThree, roleDescription, contentType, [
              permissionA,
              permissionB,
            ]).then((awxRole: AwxRbacRole) => {
              editableRoleThree = awxRole;
            });
          });
        }
      );
    });

    afterEach(() => {
      cy.deleteAwxRole(editableRole);
      cy.deleteAwxRole(editableRoleTwo);
      cy.deleteAwxRole(editableRoleThree);
    });

    it('can delete an editable role from the list view', () => {
      cy.intercept('GET', awxAPI`/role_definitions/*`).as('roleDefinitions');
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowAction('name', editableRole.name, 'delete-role', { inKebab: true });
      cy.intercept('DELETE', awxAPI`/role_definitions/${editableRole.id.toString()}/`).as(
        'deletedRole'
      );
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('[data-ouia-component-id="submit"]').click();
        cy.clickButton('Close');
      });
      cy.wait('@deletedRole').then((deleted) => {
        expect(deleted?.response?.statusCode).to.eql(204);
      });
    });

    it('can bulk delete editable roles from the list view', () => {
      cy.intercept('GET', awxAPI`/role_definitions/?order_by=name&page=1&page_size=*`).as(
        'roleDefinitions'
      );
      cy.navigateTo('platform', 'roles');
      cy.wait('@roleDefinitions');
      cy.verifyPageTitle('Roles');
      cy.setTablePageSize('50');
      cy.intercept(
        'GET',
        awxAPI`/role_definitions/?or__name__icontains=${editableRole.name}&or__name__icontains=${editableRoleTwo.name}&or__name__icontains=${editableRoleThree.name}&order_by=name&page=1&page_size=50`
      ).as('searchResults');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.filterTableByTextFilter('name', editableRoleTwo.name);
      cy.filterTableByTextFilter('name', editableRoleThree.name);
      cy.wait('@searchResults', { timeout: 40000 }).then(() => {
        cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
          cy.get('ul li').should('have.length', 3);
        });
        cy.get('tbody tr').should('have.length', 3);
        cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
          cy.getBy('[data-cy="select-all"]').click();
        });
        cy.clickToolbarKebabAction('delete-roles');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.get('[data-ouia-component-id="submit"]').click();
          cy.clickButton('Close');
        });
      });
    });
  });
});
