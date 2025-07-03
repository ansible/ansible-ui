//Tests a user's ability to give permissions to a user from the roles tab.
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { HubRemote } from '@ansible/hub-ui/administration/remotes/Remotes';
import { Repository } from '@ansible/hub-ui/administration/repositories/Repository';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { HubRbacRole } from '@ansible/hub-ui/interfaces/expanded/HubRbacRole';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { hubAPI } from '../../../support/formatApiPathForHub';

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
      cy.get('[data-cy="loading-spinner"]').should('not.exist');
    });
    cy.get(`[data-cy*="resourcetype-form-group"]`).find('button').click();
    cy.contains('button', 'Repository').click();
    cy.clickButton(/^Next$/);
    cy.getTableRowByText(hubRepository.name, true).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/*`).as('roleDefinitions');
    cy.clickButton(/^Next$/);
    cy.wait('@roleDefinitions');
    cy.getTableRowByText(repositoryRole.name, true).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.clickButton(/^Next$/);
    cy.verifyReviewStepWizardDetails('resources', [hubRepository.name], '1');
    cy.clickButton(/^Finish$/);
    cy.assertModalSuccess();
    cy.verifyPageTitle(PlatformTeam.name);
    cy.clickTab(/^Automation Content$/, true);
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
      cy.get('[data-cy="loading-spinner"]').should('not.exist');
    });
    cy.get(`[data-cy*="resourcetype-form-group"]`).find('button').click();
    cy.contains('button', 'Remote').click();
    cy.clickButton(/^Next$/);
    cy.getTableRowByText(hubRemote.name, true).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/*`).as('roleDefinitions');
    cy.clickButton(/^Next$/);
    cy.wait('@roleDefinitions');
    cy.getTableRowByText(remoteRole.name, true).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.clickButton(/^Next$/);
    cy.verifyReviewStepWizardDetails('resources', [hubRemote.name], '1');
    cy.clickButton(/^Finish$/);
    cy.assertModalSuccess();
    cy.verifyPageTitle(PlatformTeam.name);
    cy.clickTab(/^Automation Content$/, true);
    cy.contains(hubRemote.name);
    cy.contains(remoteRole.name);
    cy.contains('Remote');
    cy.navigateTo('hub', 'remotes');
    cy.setTablePageSize('50');
    cy.filterTableBySingleText(hubRemote.name);
    cy.get('[data-cy="card-view"]').click();
    cy.contains(hubRemote.name).should('be.visible');
    cy.getByDataCy('select-all').check();
    cy.clickToolbarKebabAction('delete-remotes');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete remotes$/);
    cy.contains(/^Success$/);
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
      cy.get('[data-cy="loading-spinner"]').should('not.exist');
    });
    cy.get(`[data-cy*="resourcetype-form-group"]`).find('button').click();
    cy.contains('button', 'Namespace').click();
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="text-input"]')
      .should('be.visible')
      .within(() => {
        cy.get('input').clear().type(hubNamespace.name);
      });
    cy.contains('[class*="label-group__list-item"]', hubNamespace.name);
    cy.getTableRowByText(hubNamespace.name, false).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/*`).as('roleDefinitions');
    cy.clickButton(/^Next$/);
    cy.wait('@roleDefinitions');
    cy.getTableRowByText(namespaceRole.name, true).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.clickButton(/^Next$/);
    cy.verifyReviewStepWizardDetails('resources', [hubNamespace.name], '1');
    cy.clickButton(/^Finish$/);
    cy.assertModalSuccess();
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
          cy.get('[data-cy="loading-spinner"]').should('not.exist');
        });
        cy.get(`[data-cy*="resourcetype-form-group"]`).find('button').click();
        cy.contains('button', 'Namespace').click();
        cy.clickButton(/^Next$/);
        cy.get('[data-cy="text-input"]')
          .should('be.visible')
          .within(() => {
            cy.get('input').clear().type(namespace.name);
          });
        cy.filterTableByTextFilter('name', namespace.name, { disableFilterSelection: true });
        cy.getTableRowByText(namespace.name, true, 'SingleText').within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.clickButton(/^Next$/);
        cy.filterTableByTextFilter('name', role1.name, { disableFilterSelection: true });
        cy.getTableRowByText(role1.name, true, 'SingleText').within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.filterTableByTextFilter('name', role2.name, { disableFilterSelection: true });
        cy.getTableRowByText(role2.name, true, 'SingleText').within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.filterTableByTextFilter('name', role3.name, { disableFilterSelection: true });
        cy.getTableRowByText(role3.name, true, 'SingleText').within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.clickButton(/^Next$/);
        cy.verifyReviewStepWizardDetails('resources', [namespace.name], '1');
        cy.clickButton(/^Finish$/);
        cy.assertModalSuccess();
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
    cy.filterTableByTextFilter('name', role1.name, { disableFilterSelection: true });
    cy.getTableRowByText(role1.name, false).within(() => {
      cy.get('[data-cy="remove-role"]').click();
    });
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.verifyPageTitle(PlatformTeam.name);
    cy.contains('No results found').should('be.visible');
  });

  it('can bulk remove roles', () => {
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
    cy.clickTableRow(PlatformTeam.name, true);
    cy.clickTab('Roles', true);
    cy.clickTab('Automation Content', true);
    cy.getTableRowByText(role2.name, false).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.getTableRowByText(role3.name, false).within(() => {
      cy.get('input[type=checkbox]').click();
    });
    cy.clickToolbarKebabAction('remove-roles');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.contains(role2.name).should('not.exist');
    cy.contains(role3.name).should('not.exist');
  });
});
