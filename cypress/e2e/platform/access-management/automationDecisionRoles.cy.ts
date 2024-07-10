import { EdaRbacRole } from '../../../../frontend/eda/interfaces/EdaRbacRole';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { randomString } from '../../../../framework/utils/random-string';
import { RoleDefinition } from '../../../../frontend/eda/interfaces/generated/eda-api';

describe('Automation Decisions: Roles', () => {
  describe('Automation Decisions: Verify Role Permissions', () => {
    it(`can verify that a managed Automation Decisions role displays the proper permissions`, () => {
      cy.getEdaRoles({ managed: true }).then((roles) => {
        const testRole = roles[1];
        cy.navigateTo('platform', 'roles');
        cy.get('a[href*="/access/roles/eda?"]').click();
        cy.setTablePageSize('50');
        if (testRole.managed === true) {
          cy.get('[data-ouia-component-id="simple-table"]').within(() => {
            cy.intercept('GET', edaAPI`/role_definitions/*`).as('roleDefinitions');
            cy.get(`[data-cy="row-id-${testRole.id}"]`)
              .scrollIntoView()
              .should('be.visible')
              .within(() => {
                cy.contains(`${testRole.name}`).should('be.visible');
                cy.getByDataCy('expand-column-cell').click();
              });
            cy.wait('@roleDefinitions');
            cy.getEdaRoleDetail(testRole.id.toString()).then((roleDetail) => {
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
          cy.getEdaRoleDetail(testRole.id.toString()).then((roleDetail) => {
            if (roleDetail.permissions.length > 3) {
              cy.get('[data-cy="permissions-description-list"] button').click();
            }
            const roleDetailPermissions = roleDetail.permissions;
            roleDetailPermissions.forEach((detail) => {
              cy.get(`[data-cy="${JSON.parse(JSON.stringify(detail))}"]`).should('be.visible');
            });
          });
          cy.get('[data-cy="back-to automation decisions roles"]').click();
        }
      });
    });
  });

  describe('Automation Decisions: Create and Delete Roles', () => {
    const roleTypes = [
      { role: 'Activation', rolePermission: ['view-activation', 'enable-activation'] },
      { role: 'Credential', rolePermission: ['view-credential', 'change-credential'] },
    ];

    roleTypes.forEach((roleType) => {
      it(`can create ${roleType.role} role with 2 permissions and then delete the role from the details page`, () => {
        cy.intercept('GET', edaAPI`/role_definitions/*`).as('roleDefinitions');
        cy.navigateTo('platform', 'roles');
        cy.get('a[href*="/access/roles/eda?"]').click();
        cy.wait('@roleDefinitions');
        cy.setTablePageSize('50');
        cy.verifyPageTitle('Roles');
        cy.getByDataCy('create-role').click();
        cy.verifyPageTitle('Create role');
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

  describe('Automation Decisions: Edit Roles', () => {
    let editableRole: RoleDefinition;
    const roleName = 'Activation' + `${randomString(5)}`;
    const roleDescription = roleName + '-description';
    const contentType = 'eda.activation';
    const permissionA = 'eda.restart_activation';
    const permissionB = 'eda.view_activation';

    beforeEach(() => {
      cy.createEdaRoleDefinition(roleName, roleDescription, contentType, [
        permissionA,
        permissionB,
      ]).then((edaRole: RoleDefinition) => {
        editableRole = edaRole;
      });
    });

    afterEach(() => {
      cy.deleteEdaRoleDefinition(editableRole);
    });

    it('cannot change the content type of an editable role', () => {
      cy.intercept('GET', edaAPI`/role_definitions/${editableRole.id.toString()}/`).as(
        'roleDetails'
      );
      cy.navigateTo('platform', 'roles');
      cy.get('a[href*="/access/roles/eda?"]').click();
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowLink('name', editableRole.name, { disableFilter: true });
      cy.wait('@roleDetails', { timeout: 40000 }).then(() => {
        cy.get('[data-cy="name"]').should('contain', roleName);
        expect(editableRole.name).to.eql(roleName);
        cy.get('[data-cy="description"]').should('contain', roleDescription);
        expect(editableRole.description).to.eql(roleDescription);
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionA))}"]`).should('be.visible');
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionB))}"]`).should('be.visible');
        expect(editableRole.permissions[0]).to.eql(permissionA);
        expect(editableRole.permissions[1]).to.eql(permissionB);
        cy.getByDataCy('edit-role').click();
        cy.get('[data-cy="content-type-form-group"] button').should('be.disabled');
        cy.getByDataCy('Cancel').click();
        cy.getByDataCy('eda.activation').should('contain', 'Activation');
      });
    });

    it('can edit the permissions of an editable role from the list row', () => {
      cy.navigateTo('platform', 'roles');
      cy.get('a[href*="/access/roles/eda?"]').click();
      cy.setTablePageSize('50');
      cy.intercept(
        'GET',
        edaAPI`/role_definitions/?name__startswith=${editableRole.name}&order_by=name&page=1&page_size=50`
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
              const oldPermissions = ['eda.view_activation', 'eda.restart_activation'];
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
        cy.verifyPageTitle(`Edit ${editableRole.name}`);
        cy.get(`[data-cy="permissions-form-group"]`)
          .click()
          .then(() => {
            cy.get('#permissions-select').within(() => {
              cy.get('ul').within(() => {
                const newPermissions = ['enable-activation', 'restart-activation'];
                newPermissions.forEach((newPermission) => {
                  cy.get(`li[data-cy="${newPermission}"]`).click();
                });
              });
            });
          });
        cy.intercept('PATCH', edaAPI`/role_definitions/${editableRole.id.toString()}/`).as(
          'editedRole'
        );
        cy.getByDataCy('Submit').click();
        cy.wait('@editedRole')
          .its('response.body')
          .then((response: EdaRbacRole) => {
            expect(response.permissions[0]).to.eql('eda.enable_activation');
            expect(response.permissions[1]).to.eql('eda.view_activation');
            cy.get('h4')
              .should(
                'contain',
                'These roles only apply to resources in the context of automation decisions.'
              )
              .and('be.visible');
          });
      });
    });

    it('can edit the permissions of an editable role from the details page', () => {
      cy.intercept('GET', edaAPI`/role_definitions/${editableRole.id.toString()}/`).as(
        'roleDetails'
      );
      cy.navigateTo('platform', 'roles');
      cy.get('a[href*="/access/roles/eda?"]').click();
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowLink('name', editableRole.name, { disableFilter: true });
      cy.wait('@roleDetails', { timeout: 40000 }).then(() => {
        cy.get('[data-cy="name"]').should('contain', roleName);
        expect(editableRole.name).to.eql(roleName);
        cy.get('[data-cy="description"]').should('contain', roleDescription);
        expect(editableRole.description).to.eql(roleDescription);
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionA))}"]`).should('be.visible');
        cy.get(`[data-cy="${JSON.parse(JSON.stringify(permissionB))}"]`).should('be.visible');
        expect(editableRole.permissions[0]).to.eql(permissionA);
        expect(editableRole.permissions[1]).to.eql(permissionB);
        cy.getByDataCy('edit-role').click();
        cy.verifyPageTitle(`Edit ${editableRole.name}`);
        cy.get(`[data-cy="permissions-form-group"]`)
          .click()
          .then(() => {
            cy.get('#permissions-select').within(() => {
              cy.get('ul').within(() => {
                const newPermissions = ['enable-activation', 'restart-activation'];
                newPermissions.forEach((newPermission) => {
                  cy.get(`li[data-cy="${newPermission}"]`).click();
                });
              });
            });
          });
        cy.intercept('PATCH', edaAPI`/role_definitions/${editableRole.id.toString()}/`).as(
          'editedRole'
        );
        cy.getByDataCy('Submit').click();
        cy.wait('@editedRole')
          .its('response.body')
          .then((response: EdaRbacRole) => {
            expect(response.permissions[0]).to.eql('eda.enable_activation');
            expect(response.permissions[1]).to.eql('eda.view_activation');
            cy.url().should('contain', '/details');
          });
      });
    });
  });

  describe('Automation Decisions: Delete Roles from List View', () => {
    let editableRole: EdaRbacRole;
    let editableRoleTwo: EdaRbacRole;
    let editableRoleThree: EdaRbacRole;
    const roleName = 'Activation' + `${randomString(5)}`;
    const roleNameTwo = 'ActivationTwo' + `${randomString(5)}`;
    const roleNameThree = 'ActivationThree' + `${randomString(5)}`;
    const roleDescription = roleName + '-description';
    const contentType = 'eda.activation';
    const permissionA = 'eda.restart_activation';
    const permissionB = 'eda.view_activation';

    beforeEach(() => {
      cy.createEdaRoleDefinition(roleName, roleDescription, contentType, [
        permissionA,
        permissionB,
      ]).then((edaRole: EdaRbacRole) => {
        editableRole = edaRole;

        cy.createEdaRoleDefinition(roleNameTwo, roleDescription, contentType, [
          permissionA,
          permissionB,
        ]).then((edaRole: EdaRbacRole) => {
          editableRoleTwo = edaRole;

          cy.createEdaRoleDefinition(roleNameThree, roleDescription, contentType, [
            permissionA,
            permissionB,
          ]).then((edaRole: EdaRbacRole) => {
            editableRoleThree = edaRole;
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteEdaRoleDefinition(editableRole);
      cy.deleteEdaRoleDefinition(editableRoleTwo);
      cy.deleteEdaRoleDefinition(editableRoleThree);
    });

    it('can delete an editable role from the list view', () => {
      cy.navigateTo('platform', 'roles');
      cy.get('a[href*="/access/roles/eda?"]').click();
      cy.setTablePageSize('50');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.clickTableRowAction('name', editableRole.name, 'delete-role', { inKebab: true });
      cy.intercept('DELETE', edaAPI`/role_definitions/${editableRole.id.toString()}/`).as(
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
      cy.navigateTo('platform', 'roles');
      cy.get('a[href*="/access/roles/eda?"]').click();
      cy.setTablePageSize('50');
      cy.intercept(
        'GET',
        edaAPI`/role_definitions/?or__name__startswith=${editableRole.name}&or__name__startswith=${editableRoleTwo.name}&or__name__startswith=${editableRoleThree.name}&order_by=name&page=1&page_size=50`
      ).as('searchResults');
      cy.filterTableByTextFilter('name', editableRole.name);
      cy.filterTableByTextFilter('name', editableRoleTwo.name);
      cy.filterTableByTextFilter('name', editableRoleThree.name);
      cy.wait('@searchResults').then(() => {
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
