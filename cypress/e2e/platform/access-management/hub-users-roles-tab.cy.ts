//Tests a user's ability to give permissions to a user from the roles tab.
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { HubRemote } from '@ansible/hub-ui/administration/remotes/Remotes';
import { Repository } from '@ansible/hub-ui/administration/repositories/Repository';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { HubRbacRole } from '@ansible/hub-ui/interfaces/expanded/HubRbacRole';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { hub_resources_roles_tab } from '../../../support/constants';
import { hubAPI } from '../../../support/formatApiPathForHub';

hub_resources_roles_tab.forEach((resource) => {
  describe(`Assign Role to a User `, () => {
    let role: HubRbacRole;
    let user: PlatformUser;
    let resource_object: Repository | HubRemote | HubNamespace;
    before(() => {
      resource?.creation?.().then((resource_instance) => {
        resource_object = resource_instance;
      });
      cy.createPlatformUser().then((PlatformUser) => {
        user = PlatformUser;
      });
      cy.createHubRoleAPI({
        roleName: 'galaxy.' + `${randomString(5)}`,
        description: 'Custom Role',
        content_type: resource.content_type,
        permissions: [resource.permission],
      }).then((createdRole) => {
        role = createdRole;
      });
    });

    after(() => {
      cy.deleteHubRoleAPI(role);
      if (resource.name === 'Remote') {
        cy.navigateTo('hub', 'remotes');
        cy.setTablePageSize('50');
        cy.filterTableByTextFilter('name', resource_object.name, {
          disableFilterSelection: true,
          expectedLength: 1,
        });
        cy.get('[data-cy="card-view"]').click();
        cy.contains(resource_object.name).should('be.visible');
        cy.getByDataCy('select-all').check();
        cy.clickToolbarKebabAction('delete-remotes');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete remotes$/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Clear all filters$/);
      } else {
        if (resource.deletion !== null && resource_object !== undefined) {
          resource.deletion(resource_object);
        }
      }
      cy.deletePlatformUser(user);
    });

    it(`for ${resource.name} role type`, () => {
      cy.navigateTo('platform', 'users');
      cy.verifyPageTitle('Users');
      cy.clickTableRowLink('username', user.username);
      cy.clickTab('Roles', true);
      cy.clickTab('Automation Content', true);
      cy.getByDataCy('add-roles').click();
      cy.getWizard().within(() => {
        cy.selectDropdownOptionByResourceName('resourcetype', resource.name);
        cy.clickButton(/^Next$/);
        if (resource.name === 'Namespace') {
          cy.get('[data-cy="text-input"]')
            .should('be.visible')
            .within(() => {
              cy.get('input').clear().type(resource_object.name);
            });
          cy.contains('.pf-v5-c-chip__text', resource_object.name);
          cy.selectTableRowByCheckbox('name', resource_object.name, {
            disableFilterSelection: true,
          });
        } else {
          cy.selectTableRowByCheckbox('name', resource_object.name, {
            disableFilterSelection: true,
          });
        }
        cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/*`).as('roleDefinitions');
        cy.clickButton(/^Next/);
        cy.wait('@roleDefinitions');
        cy.selectTableRowByCheckbox('name', role.name, { disableFilterSelection: true });
        cy.clickButton(/^Next$/);
        cy.verifyReviewStepWizardDetails('resources', [resource_object.name], '1');
        cy.clickButton(/^Finish$/);
      });
      cy.assertModalSuccess();
      cy.verifyPageTitle(user.username);
      cy.contains(resource_object.name);
      cy.contains(role.name);
      cy.contains(resource.name);
    });
  });
});

describe(`Roles Tab for Users - actions`, () => {
  let user: PlatformUser;
  let HubNamespace: HubNamespace;
  let role1: HubRbacRole;
  let role2: HubRbacRole;
  let role3: HubRbacRole;
  before(() => {
    cy.createPlatformUser().then((PlatformUser) => {
      user = PlatformUser;
      cy.createHubRoleAPI({
        roleName: 'galaxy.' + `${randomString(5)}`,
        description: 'Custom Role',
        content_type: ContentTypeEnum.Namespace,
        permissions: ['galaxy.view_namespace'],
      }).then((createdRole) => {
        role1 = createdRole;
      });
      cy.createHubRoleAPI({
        roleName: 'galaxy.' + `${randomString(5)}`,
        description: 'Custom Role',
        content_type: ContentTypeEnum.Namespace,
        permissions: ['galaxy.view_namespace', 'galaxy.change_namespace'],
      }).then((createdRole) => {
        role2 = createdRole;
      });
      cy.createHubRoleAPI({
        roleName: 'galaxy.' + `${randomString(5)}`,
        description: 'Custom Role',
        content_type: ContentTypeEnum.Namespace,
        permissions: ['galaxy.view_namespace', 'galaxy.delete_namespace'],
      }).then((createdRole) => {
        role3 = createdRole;
      });
      cy.createHubNamespace().then((namespace) => {
        HubNamespace = namespace;
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.clickTableRowLink('username', user.username);
        cy.clickTab('Roles', true);
        cy.clickTab('Automation Content', true);
        cy.getByDataCy('add-roles').click();
        cy.getWizard().within(() => {
          cy.selectDropdownOptionByResourceName('resourcetype', 'Namespace');
          cy.clickButton(/^Next$/);
          cy.get('[data-cy="text-input"]')
            .should('be.visible')
            .within(() => {
              cy.get('input').clear().type(namespace.name);
            });
          cy.selectTableRowByCheckbox('name', namespace.name, {
            disableFilterSelection: true,
          });
          cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/*`).as('roleDefinitions');
          cy.clickButton(/^Next/);
          cy.wait('@roleDefinitions');
          cy.selectTableRowByCheckbox('name', role1.name, {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', role2.name, {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', role3.name, {
            disableFilterSelection: true,
          });
          cy.clickButton(/^Next$/);
          cy.verifyReviewStepWizardDetails('resources', [namespace.name], '1');
          cy.clickButton(/^Finish$/);
        });
        cy.assertModalSuccess();
        cy.verifyPageTitle(user.username);
      });
    });
  });

  after(() => {
    cy.deletePlatformUser(user);
    cy.deleteHubNamespace(HubNamespace);
    cy.deleteHubRoleAPI(role1);
    cy.deleteHubRoleAPI(role2);
    cy.deleteHubRoleAPI(role3);
  });

  it('can remove role from row', () => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
    cy.clickTableRowLink('username', user.username);
    cy.getByDataCy('username').should('contain', user.username);
    cy.clickTab('Roles', true);
    cy.clickTab('Automation Content', true);
    cy.getTableRow('role', role1.name, { disableFilterSelection: true }).within(() => {
      cy.get(`[data-cy="actions-column-cell"]`).within(() => {
        cy.getBy(`[data-cy="remove-role"]`).click();
      });
    });
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.contains('tr', role1.name).should('not.exist');
  });

  it('can bulk remove roles', () => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
    cy.clickTableRowLink('username', user.username);
    cy.clickTab('Roles', true);
    cy.clickTab('Automation Content', true);
    cy.selectTableRowByCheckbox('role', role2.name, {
      disableFilterSelection: true,
    });
    cy.selectTableRowByCheckbox('role', role3.name, {
      disableFilterSelection: true,
    });
    cy.clickToolbarKebabAction('remove-roles');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.contains('tr', role2.name).should('not.exist');
    cy.contains('tr', role3.name).should('not.exist');
  });
});
