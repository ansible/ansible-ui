//Tests a user's ability to give permissions to a user from the roles tab.
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { Repository } from '../../../../frontend/hub/administration/repositories/Repository';
import { HubRemote } from '../../../../frontend/hub/administration/remotes/Remotes';
import { HubNamespace } from '../../../../frontend/hub/namespaces/HubNamespace';
import { randomString } from '../../../../framework/utils/random-string';
import { ContentTypeEnum } from '../../../../frontend/hub/interfaces/expanded/ContentType';
import { HubRbacRole } from '../../../../frontend/hub/interfaces/expanded/HubRbacRole';

describe(`Assign Role to a Team `, () => {
  let PlatformUser: PlatformUser;
  let PlatformTeam: PlatformTeam;
  let hubRepository: Repository;
  let hubRemote: HubRemote;
  let hubNamespace: HubNamespace;
  let repositoryRole: HubRbacRole;
  let remoteRole: HubRbacRole;
  let namespaceRole: HubRbacRole;

  before(() => {
    cy.createHubRoleAPI({
      roleName: 'galaxy.' + `${randomString(5)}-repository`,
      description: 'Custom Repository Role',
      content_type: ContentTypeEnum.Repository,
      permissions: ['galaxy.view_ansiblerepository'],
    }).then((repoRole) => {
      repositoryRole = repoRole;
    });
    cy.createHubRoleAPI({
      roleName: 'galaxy.' + `${randomString(5)}-remote`,
      description: 'Custom Collection Remote Role',
      content_type: ContentTypeEnum.CollectionRemote,
      permissions: ['galaxy.view_collectionremote'],
    }).then((remRole) => {
      remoteRole = remRole;
    });
    cy.createHubRoleAPI({
      roleName: 'galaxy.' + `${randomString(5)}-namespace`,
      description: 'Custom Namespace Role',
      content_type: ContentTypeEnum.Namespace,
      permissions: ['galaxy.view_namespace'],
    }).then((nsRole) => {
      namespaceRole = nsRole;
    });

    const testSignature: string = randomString(5, undefined, { isLowercase: true });
    const generateRemoteName = `test-${testSignature}-remote-${randomString(5, undefined, { isLowercase: true })}`;
    cy.createRemote(generateRemoteName).then((hubRem) => {
      hubRemote = hubRem;
    });

    cy.createHubRepository().then((hubRepo) => {
      hubRepository = hubRepo;
    });

    cy.createHubNamespace().then((hubNS) => {
      hubNamespace = hubNS;
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
    cy.deleteHubRoleAPI(repositoryRole);
    cy.deleteHubRoleAPI(remoteRole);
    cy.deleteHubRoleAPI(namespaceRole);
    cy.deleteHubRepository(hubRepository);
    cy.deleteHubNamespace(hubNamespace);
    cy.deletePlatformUser(PlatformUser, { failOnStatusCode: false });
    cy.deletePlatformTeam(PlatformTeam, { failOnStatusCode: false });
  });

  it(`for Repository role type`, () => {
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
    cy.clickTableRow(PlatformTeam.name, true);
    cy.clickTab('Roles', true);
    cy.clickTab('Automation Content', true);
    cy.getByDataCy('add-roles').click();
    cy.getWizard().within(() => {
      cy.selectDropdownOptionByResourceName('resourcetype', 'Repository');
      cy.clickButton(/^Next$/);
      cy.selectTableRow(hubRepository.name, false);
      cy.clickButton(/^Next$/);
      cy.selectTableRow(repositoryRole.name, false);
      cy.clickButton(/^Next$/);
      cy.verifyReviewStepWizardDetails('resources', [hubRepository.name], '1');
      cy.clickButton(/^Finish$/);
    });
    cy.assertModalSuccess();
    cy.clickButton(/^Close$/);
    cy.verifyPageTitle(PlatformTeam.name);
    cy.contains(hubRepository.name);
    cy.contains(repositoryRole.name);
    cy.contains('Repository');
  });

  it(`for Remote role type`, () => {
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
    cy.clickTableRow(PlatformTeam.name, true);
    cy.clickTab('Roles', true);
    cy.clickTab('Automation Content', true);
    cy.getByDataCy('add-roles').click();
    cy.getWizard().within(() => {
      cy.selectDropdownOptionByResourceName('resourcetype', 'Remote');
      cy.clickButton(/^Next$/);
      cy.selectTableRow(hubRemote.name, false);
      cy.clickButton(/^Next$/);
      cy.selectTableRow(remoteRole.name, false);
      cy.clickButton(/^Next$/);
      cy.verifyReviewStepWizardDetails('resources', [hubRemote.name], '1');
      cy.clickButton(/^Finish$/);
    });
    cy.assertModalSuccess();
    cy.clickButton(/^Close$/);
    cy.verifyPageTitle(PlatformTeam.name);
    cy.contains(hubRemote.name);
    cy.contains(remoteRole.name);
    cy.contains('Remote');
    cy.navigateTo('hub', 'remotes');
    cy.setTablePageSize('50');
    cy.filterTableBySingleText(hubRemote.name);
    cy.get('[data-cy="card-view"]').click();
    cy.contains(hubRemote.name).should('be.visible');
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction('delete-remotes');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete remotes$/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it(`for Namespace role type`, () => {
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
          cy.get('input').clear().type(hubNamespace.name);
        });
      cy.contains('.pf-v5-c-chip__text', hubNamespace.name);
      cy.selectTableRow(hubNamespace.name, false);
      cy.clickButton(/^Next$/);
      cy.selectTableRow(namespaceRole.name, false);
      cy.clickButton(/^Next$/);
      cy.verifyReviewStepWizardDetails('resources', [hubNamespace.name], '1');
      cy.clickButton(/^Finish$/);
    });
    cy.assertModalSuccess();
    cy.clickButton(/^Close$/);
    cy.verifyPageTitle(PlatformTeam.name);
    cy.contains(hubNamespace.name);
    cy.contains(namespaceRole.name);
    cy.contains('Namespace');
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
