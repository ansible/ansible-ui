//Tests a user's ability to give permissions to a user from the roles tab.
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { hub_resources_roles_tab } from '../../../support/constants';
import { Repository } from '../../../../frontend/hub/administration/repositories/Repository';
import { HubRemote } from '../../../../frontend/hub/administration/remotes/Remotes';
import { HubNamespace } from '../../../../frontend/hub/namespaces/HubNamespace';
import { randomString } from '../../../../framework/utils/random-string';
import { ContentTypeEnum } from '../../../../frontend/hub/interfaces/expanded/ContentType';
import { HubRbacRole } from '../../../../frontend/hub/interfaces/expanded/HubRbacRole';

hub_resources_roles_tab.forEach((resource) => {
  describe(`Assign Role to a Team `, () => {
    let role: HubRbacRole;
    let PlatformUser: PlatformUser;
    let PlatformTeam: PlatformTeam;
    let resource_object: Repository | HubRemote | HubNamespace;
    before(() => {
      cy.createHubRoleAPI({
        roleName: 'galaxy.' + `${randomString(5)}`,
        description: 'Custom Role',
        content_type: resource.content_type,
        permissions: [resource.permission],
      }).then((createdRole) => {
        role = createdRole;
      });
      resource.creation().then((resource_instance) => {
        resource_object = resource_instance;
      });
      cy.createPlatformUser({ password: 'pass' }).then((user) => {
        PlatformUser = user;
        cy.createPlatformTeam({
          organization: 1,
        }).then((team) => {
          cy.associateUsersWithPlatformTeam(team, [PlatformUser]).then(() => {
            PlatformTeam = team;
          });
        });
      });
    });

    after(() => {
      cy.deleteHubRoleAPI(role);
      if (resource.name === 'Remote') {
        cy.navigateTo('hub', 'remotes');
        cy.setTablePageSize('50');
        cy.filterTableBySingleText(resource_object.name);
        cy.get('[data-cy="card-view"]').click();
        cy.contains(resource_object.name).should('be.visible');
        cy.get('#select-all').click();
        cy.clickToolbarKebabAction('delete-remotes');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete remotes$/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      } else {
        resource.deletion(resource_object);
      }
      cy.deletePlatformUser(PlatformUser);
      cy.deletePlatformTeam(PlatformTeam);
      cy.deleteHubRoleAPI(role);
    });

    it(`for ${resource.name} role type`, () => {
      cy.navigateTo('platform', 'teams');
      cy.verifyPageTitle('Teams');
      cy.clickTableRow(PlatformTeam.name, true);
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
        }
        cy.selectTableRow(resource_object.name, false);
        cy.clickButton(/^Next$/);
        cy.selectTableRow(role.name, false);
        cy.clickButton(/^Next$/);
        cy.verifyReviewStepWizardDetails('resources', [resource_object.name], '1');
        cy.clickButton(/^Finish$/);
      });
      cy.assertModalSuccess();
      cy.clickButton(/^Close$/);
      cy.verifyPageTitle(PlatformTeam.name);
      cy.contains(resource_object.name);
      cy.contains(role.name);
      cy.contains(resource.name);
    });
  });
});

describe(`Roles Tab for Teams - actions`, () => {
  let PlatformUser: PlatformUser;
  let PlatformTeam: PlatformTeam;
  let HubNamespace: HubNamespace;
  let role1: HubRbacRole;
  let role2: HubRbacRole;
  let role3: HubRbacRole;
  before(() => {
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
    cy.createPlatformUser({ password: 'pass' }).then((user) => {
      PlatformUser = user;
      cy.createPlatformTeam({
        organization: 1,
      }).then((team) => {
        cy.associateUsersWithPlatformTeam(team, [PlatformUser]).then(() => {
          PlatformTeam = team;
        });
      });
      cy.createHubNamespace().then((namespace) => {
        HubNamespace = namespace;
        cy.navigateTo('platform', 'teams');
        cy.verifyPageTitle('Teams');
        cy.clickTableRow(PlatformTeam.name, true);
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
          cy.selectTableRow(namespace.name, false);
          cy.clickButton(/^Next$/);
          cy.selectTableRow(role1.name, true);
          cy.selectTableRow(role2.name, true);
          cy.selectTableRow(role3.name, true);
          cy.clickButton(/^Next$/);
          cy.verifyReviewStepWizardDetails('resources', [namespace.name], '1');
          cy.clickButton(/^Finish$/);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.verifyPageTitle(PlatformTeam.name);
      });
    });
  });

  after(() => {
    cy.deletePlatformUser(PlatformUser);
    cy.deletePlatformTeam(PlatformTeam);
    cy.deleteHubNamespace(HubNamespace);
    cy.deleteHubRoleAPI(role1);
    cy.deleteHubRoleAPI(role2);
    cy.deleteHubRoleAPI(role3);
  });

  it('can remove role from row', () => {
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
    cy.clickTableRow(PlatformTeam.name, true);
    cy.clickTab('Roles', true);
    cy.clickTab('Automation Content', true);
    cy.getTableRowByText(role1.name, false).within(() => {
      cy.get('[data-cy="remove-role"]').click();
    });
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.clickButton(/^Close$/);
    cy.contains(role1.name).should('not.exist');
  });

  it('can bulk remove roles', () => {
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
    cy.clickTableRow(PlatformTeam.name, true);
    cy.clickTab('Roles', true);
    cy.clickTab('Automation Content', true);
    cy.selectTableRow(role2.name, false);
    cy.selectTableRow(role3.name, false);
    cy.clickToolbarKebabAction('remove-roles');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.clickButton(/^Close$/);
    cy.contains(role2.name).should('not.exist');
    cy.contains(role3.name).should('not.exist');
  });
});
