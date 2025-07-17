import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { NotificationTemplate } from '@ansible/awx-ui/interfaces/NotificationTemplate';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { AZURE_URL, SAAS_URL } from '../../../support/constants';
import { gatewayAPI } from '../../../support/formatApiPathForPlatform';
import { randomE2Ename } from '../../../support/utils';

describe('Platform Organizations - Create, Edit and Delete', () => {
  const organizationName = `e2e org ${randomE2Ename()}`;
  const orgDescription = 'orgDescription' + randomString(4);
  const listEditedOrganizationName = `E2E Platform Org ${randomE2Ename()}`;
  const detailsEditedOrganizationName = `E2E Platform Org ${randomE2Ename()}`;
  let organization: PlatformOrganization;

  beforeEach(() => {
    cy.createPlatformOrganization().then((org) => {
      organization = org;
    });

    cy.navigateTo('platform', 'organizations');
    cy.verifyPageTitle('Organizations');
    cy.setTableView('table');
  });

  afterEach(() => {
    cy.deletePlatformOrganization(organization, { failOnStatusCode: false });
  });

  it('creates a basic organization and deletes it from the details page', () => {
    cy.clickLink(/^Create organization$/);
    cy.getByDataCy('organization-name').type(organizationName);
    cy.getByDataCy('organization-description').type(orgDescription);
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.getByDataCy('Details').should('be.visible');
    cy.verifyPageTitle(organizationName);
    cy.getByDataCy('name').should('contain', organizationName);
    cy.getByDataCy('description').should('contain', orgDescription);
    cy.clickPageAction('delete-organization');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.verifyPageTitle('Organizations');
  });

  it('edits an organization from the list view', () => {
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.getByDataCy('edit-organization').click();
    cy.verifyPageTitle(`Edit ${organization.name}`);
    cy.get('[data-cy="organization-name"]')
      .clear()
      .type(`${listEditedOrganizationName} from list page`);
    const orgId = `${organization.id}`.toString();
    cy.intercept('PATCH', gatewayAPI`/organizations/${orgId}`).as('edited');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.wait('@edited')
      .its('response.body.name')
      .then((editedName) => {
        cy.verifyPageTitle(`${editedName}`);
      });
  });

  it('edits an organization from the details view', () => {
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.getByDataCy('name-column-cell').contains(organization.name).click();
    cy.verifyPageTitle(organization.name);
    cy.getByDataCy('edit-organization').click();
    cy.verifyPageTitle(`Edit ${organization.name}`);
    cy.get('[data-cy="organization-name"]')
      .clear()
      .type(`${detailsEditedOrganizationName} from details page`);
    const orgId = `${organization.id}`.toString();
    cy.intercept('PATCH', gatewayAPI`/organizations/${orgId}`).as('edited');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.wait('@edited')
      .its('response.body.name')
      .then((editedName) => {
        cy.verifyPageTitle(`${editedName}`);
      });
  });

  it('deletes an organization from the organizations list view', () => {
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.clickTableRowAction('name', organization.name, 'delete-organization', {
      inKebab: true,
      disableFilter: true,
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.contains(/^Success$/);
  });

  it('bulk creates and deletes an organization from the organizations list toolbar', () => {
    let testOrganization1: PlatformOrganization;
    let testOrganization2: PlatformOrganization;
    cy.createPlatformOrganization().then((organization: PlatformOrganization) => {
      testOrganization1 = organization;
      cy.createPlatformOrganization().then((organization: PlatformOrganization) => {
        testOrganization2 = organization;
        cy.filterTableByTextFilter('name', testOrganization1.name, {
          disableFilterSelection: true,
        });
        cy.getTableRowByText(testOrganization1.name, false).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.clearAllFilters();
        cy.filterTableByTextFilter('name', testOrganization2.name, {
          disableFilterSelection: true,
        });
        cy.getTableRowByText(testOrganization2.name, false).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.clickToolbarKebabAction('delete-organizations');
        cy.intercept('DELETE', gatewayAPI`/organizations/${testOrganization1.id.toString()}/`).as(
          'edaPlatformOrg1'
        );
        cy.intercept('DELETE', gatewayAPI`/organizations/${testOrganization1.id.toString()}/`).as(
          'edaPlatformOrg2'
        );
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete organizations');
        cy.wait('@edaPlatformOrg1').then((edaPlatformOrg1) => {
          expect(edaPlatformOrg1?.response?.statusCode).to.eql(204);
        });
        cy.wait('@edaPlatformOrg2').then((edaPlatformOrg2) => {
          expect(edaPlatformOrg2?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});

describe('If SaaS Build', () => {
  before(function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        cy.log('Test/tests should not run on this deployment.');
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('Platform Organizations - Users, Admins, Teams and EE tabs', function () {
    let organization: PlatformOrganization;

    beforeEach(() => {
      cy.createPlatformOrganization().then((org) => {
        organization = org;
      });

      cy.navigateTo('platform', 'organizations');
      cy.verifyPageTitle('Organizations');
      cy.setTableView('table');
    });

    afterEach(() => {
      cy.deletePlatformOrganization(organization, { failOnStatusCode: false });
    });

    it('can add a user and apply the roles to the users of an organization via the users tab', function () {
      cy.createPlatformUser().then((createdUser1) => {
        cy.createPlatformUser().then((createdUser2) => {
          cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
          cy.clickTableRowLink('name', organization.name, { disableFilter: true });
          cy.clickTab('Users', true);
          cy.clickLink('Assign users');
          cy.verifyPageTitle('Assign users');
          cy.getWizard().within(() => {
            cy.selectTableRowByCheckbox('username', createdUser1.username);
            cy.selectTableRowByCheckbox('username', createdUser2.username);
            cy.clickButton(/^Next/);
            cy.contains('h1', 'Select Automation Execution roles').should('be.visible');
            cy.filterTableByTextFilter('name', 'Organization Credential Admin', {
              disableFilterSelection: true,
            });
            cy.selectTableRowByCheckbox('name', 'Organization Credential Admin', {
              disableFilter: true,
            });
            cy.clickButton(/^Next/);
            cy.contains('h1', 'Select Automation Decisions roles').should('be.visible');
            cy.filterTableByTextFilter('name', 'Editor', {
              disableFilterSelection: true,
            });
            cy.selectTableRowByCheckbox('name', 'Editor', {
              disableFilter: true,
            });
            cy.clickButton(/^Next/);
            cy.contains('h1', 'Review').should('be.visible');
            cy.verifyReviewStepWizardDetails(
              'edaRoles',
              [
                'Organization Editor',
                'Has create and update permissions to all objects within a single organization',
              ],
              '1'
            );
            cy.verifyReviewStepWizardDetails(
              'awxRoles',
              [
                'Organization Credential Admin',
                'Has all permissions to credentials within an organization',
              ],
              '1'
            );
            cy.verifyReviewStepWizardDetails(
              'users',
              [createdUser1.username, createdUser2.username],
              '2'
            );
            cy.clickButton(/^Finish/);
          });
          cy.getModal().should('not.exist');
          cy.verifyPageTitle(organization.name);
          cy.selectTableRowByCheckbox('username', createdUser1.username);
          cy.selectTableRowByCheckbox('username', createdUser2.username);
          cy.clickToolbarKebabAction('remove-users');
          cy.getModal().within(() => {
            cy.get('#confirm').click();
            cy.get('#submit').click();
            cy.contains(/^Success$/).should('be.visible');
          });
          cy.clickButton(/^Clear all filters$/);
          cy.deletePlatformUser(createdUser1, { failOnStatusCode: false });
          cy.deletePlatformUser(createdUser2, { failOnStatusCode: false });
        });
      });
    });

    it('verifies the modal displayed when no organization roles are added to a user', function () {
      cy.createPlatformUser().then((createdUser1) => {
        cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
        cy.clickTableRowLink('name', organization.name, { disableFilter: true });
        cy.clickTab('Users', true);
        cy.clickLink('Assign users');
        cy.verifyPageTitle('Assign users');
        cy.getWizard().within(() => {
          cy.selectTableRowByCheckbox('username', createdUser1.username);
          cy.clickButton(/^Next/);
          cy.clickButton(/^Next/);
          cy.clickButton(/^Next/);
          cy.clickButton(/^Finish/);
        });
        cy.getModal().should('not.exist');
        cy.verifyPageTitle(organization.name);
        cy.clickTableRowPinnedAction(createdUser1.username, 'manage-organization-roles', false);
        cy.getModal().within(() => {
          cy.contains(
            `${createdUser1.username} has no organization roles. To add roles to ${createdUser1.username} click on the button below.`
          ).should('be.visible');
        });
        cy.getModal().within(() => {
          cy.clickButton(/^Close$/);
        });
        cy.deletePlatformUser(createdUser1, { failOnStatusCode: false });
      });
    });

    it('can add and remove users from an org using the administrators tab', function () {
      cy.createPlatformUser().then((user) => {
        cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
        cy.clickTableRowLink('name', organization.name, { disableFilter: true });
        cy.clickTab('Administrators', true);
        cy.getByDataCy('add-administrators').click();
        cy.contains('h1', 'Add administrators');
        cy.getModal().within(() => {
          cy.selectTableRowByCheckbox('username', user.username);
          cy.getBy('#submit').click();
        });
        cy.getModal().should('not.exist');
        cy.getBy('[data-cy="remove-administrator"]').click();
        cy.getModal().within(() => {
          cy.getBy('#confirm').click();
          cy.getBy('#submit').click();
        });
        cy.deletePlatformUser(user, { failOnStatusCode: false });
      });
    });

    it("can add a team and apply and remove the roles from an organization's team via the teams tab", function () {
      cy.createPlatformTeam({ organization: organization.id }).then((team) => {
        const createdPlatformTeam = team.name;
        cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
        cy.clickTableRowLink('name', organization.name, { disableFilter: true });
        cy.clickTab('Teams', true);
        cy.getByDataCy('assign-organization-roles').click();
        cy.verifyPageTitle('Assign organization roles');
        cy.getWizard().within(() => {
          cy.filterTableByTextFilter('name', createdPlatformTeam, {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', createdPlatformTeam, {
            disableFilter: true,
          });
          cy.clickButton(/^Next/);
          cy.contains('h1', 'Select Automation Execution roles').should('be.visible');
          cy.filterTableByTextFilter('name', 'Organization Audit', {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', 'Organization Audit', {
            disableFilter: true,
          });
          cy.clickButton(/^Next/);
          cy.contains('h1', 'Select Automation Decisions roles').should('be.visible');
          cy.filterTableByTextFilter('name', 'Operator', {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', 'Operator', {
            disableFilter: true,
          });
          cy.clickButton(/^Next/);
          cy.contains('h1', 'Review').should('be.visible');
          cy.verifyReviewStepWizardDetails(
            'edaRoles',
            [
              'Organization Operator',
              'Has read permission to all objects and enable/disable/restart permissions for all rulebook activations within a single organization',
            ],
            '1'
          );
          cy.verifyReviewStepWizardDetails(
            'awxRoles',
            [
              'Organization Audit',
              'Has permission to view all objects inside of a single organization',
            ],
            '1'
          );
          cy.verifyReviewStepWizardDetails('teams', [createdPlatformTeam], '1');
          cy.clickButton(/^Finish/);
        });
        cy.getModal().should('not.exist');
        cy.verifyPageTitle(organization.name);
        cy.getTableRow('name', createdPlatformTeam, { disableFilter: true }).within(() => {
          cy.get('[data-cy="view-and-manage-organization-roles"]').click();
        });
        cy.getModal().should('exist');
        cy.getModal().within(() => {
          cy.get('[data-ouia-component-id="manage-roles-modal-manage-roles-button"]').click();
        });
        cy.getWizard().within(() => {
          cy.contains('h1', 'Select Automation Execution roles').should('be.visible');
          cy.filterTableByTextFilter('name', 'Organization Audit', {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', 'Organization Audit', {
            disableFilter: true,
          });
          cy.clickButton(/^Next/);
          cy.contains('h1', 'Select Automation Decisions roles').should('be.visible');
          cy.filterTableByTextFilter('name', 'Operator', {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', 'Operator', {
            disableFilter: true,
          });
          cy.clickButton(/^Next/);
          cy.contains('h1', 'Review').should('be.visible');
          cy.contains('.pf-v6-c-description-list__text', createdPlatformTeam).should('be.visible');
          cy.clickButton(/^Finish/);
        });
        cy.verifyPageTitle(organization.name);
        cy.contains('a', `${createdPlatformTeam}`).click();
        cy.verifyPageTitle(createdPlatformTeam);
        cy.clickTab('Roles', true);
        cy.contains('h4', 'There are currently no roles assigned to this team.').should(
          'be.visible'
        );
        cy.get('li.pf-v6-c-tabs__item').contains('Automation Decisions').click();
        cy.contains('h4', 'There are currently no roles assigned to this team.').should(
          'be.visible'
        );
        cy.deletePlatformTeam(team, { failOnStatusCode: false });
      });
    });

    it('verifies the modal displayed when organization roles are not added to the team', function () {
      cy.createPlatformTeam({ organization: organization.id }).then((team) => {
        const createdPlatformTeam = team.name;
        cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
        cy.clickTableRowLink('name', organization.name, { disableFilter: true });
        cy.clickTab('Teams', true);
        cy.getByDataCy('assign-organization-roles').click();
        cy.verifyPageTitle('Assign organization roles');
        cy.getWizard().within(() => {
          cy.selectTableRowByCheckbox('name', createdPlatformTeam, { disableFilter: true });
          cy.clickButton(/^Next/);
          cy.clickButton(/^Next/);
          cy.clickButton(/^Next/);
          cy.clickButton(/^Finish/);
          // TODO: Update after no items modal is removed AAP-25090
        });
        cy.deletePlatformTeam(team, { failOnStatusCode: false });
      });
    });

    it('can create a team from the teams tab of an organization then delete team from details page', function () {
      cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
      cy.clickTableRowLink('name', organization.name, { disableFilter: true });
      cy.clickTab('Teams', true);
      const teamName = `E2E PlatformTeam ${randomString(4)}`;
      cy.intercept('POST', gatewayAPI`/teams/`).as('createTeam');
      cy.clickLink(/^Go to Teams section and create team$/);
      cy.get('[data-cy="name"]').type(teamName);
      cy.singleSelectByDataCy('organization', organization.name);
      cy.clickButton(/^Create team$/);
      cy.verifyPageTitle(teamName);
      cy.hasDetail('Organization', organization.name);
      cy.clickPageAction('delete-team');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.wait('@createTeam')
        .its('response.body')
        .then((team: PlatformTeam) => {
          cy.deletePlatformTeam(team, { failOnStatusCode: false });
        });
    });
  });
});

describe('Notifications Tab for Organizations', function () {
  let notificationName: string;
  let organization: PlatformOrganization;
  let notification: NotificationTemplate;
  let awxOrganization: Organization;

  beforeEach(() => {
    notificationName = randomE2Ename();
    cy.createPlatformOrganization().then((org) => {
      organization = org;

      cy.getAwxOrgByAnsibleId(organization.summary_fields.resource?.ansible_id).then((awxOrg) => {
        awxOrganization = awxOrg;
      });
    });

    cy.navigateTo('platform', 'organizations');
    cy.verifyPageTitle('Organizations');
    cy.setTableView('table');
  });

  it('can navigate to the Organizations -> Notifications list and then to the details page of the Notification', () => {
    cy.createNotificationTemplate(notificationName, awxOrganization).then((notifier) => {
      notification = notifier;
      cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
      cy.clickTableRowLink('name', organization.name, { disableFilter: true });
      cy.contains(awxOrganization.name);
      cy.contains(`a[role="tab"]`, 'Notifications').click();
      cy.filterTableBySearch(notificationName);
      cy.get(`[aria-label="Simple table"] tbody`).find('tr').should('have.length', 1);
      cy.get('[data-cy="name-column-cell"] a').click();
      cy.contains(notificationName);
      cy.deletePlatformNotificationTemplate(notification, { failOnStatusCode: false });
    });
  });

  it('can toggle the Organizations -> Notification on and off for job approval', () => {
    cy.createNotificationTemplate(notificationName, awxOrganization).then((notifier) => {
      notification = notifier;
      cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
      cy.clickTableRowLink('name', organization.name, { disableFilter: true });
      cy.contains(awxOrganization.name);
      cy.contains(`a[role="tab"]`, 'Notifications').click();
      cy.filterTableByTextFilter('name', notificationName, { disableFilterSelection: true });
      cy.get(`[aria-label="Simple table"] tbody`)
        .find('tr')
        .contains(notificationName)
        .should('have.length', 1);
      cy.get(`[aria-label="Click to enable approval"]`).click();
      cy.get(`[aria-label="Click to disable approval"]`, { timeout: 5000 }).click();
      cy.get(`[aria-label="Click to enable approval"]`, { timeout: 5000 });
      cy.deletePlatformNotificationTemplate(notification, { failOnStatusCode: false });
    });
  });

  it('can toggle the Organizations -> Notification on and off for job start', () => {
    cy.createNotificationTemplate(notificationName, awxOrganization).then((notifier) => {
      notification = notifier;
      cy.filterTableByTextFilter('name', awxOrganization.name, { disableFilterSelection: true });
      cy.clickTableRowLink('name', awxOrganization.name, { disableFilter: true });
      cy.contains(awxOrganization.name);
      cy.contains(`a[role="tab"]`, 'Notifications').click();
      cy.filterTableByTextFilter('name', notificationName, { disableFilterSelection: true });
      cy.get(`[aria-label="Simple table"] tbody`)
        .find('tr')
        .contains(notificationName)
        .should('have.length', 1);
      cy.get(`[aria-label="Click to enable start"]`).eq(0).click();
      cy.get(`[aria-label="Click to disable start"]`, { timeout: 5000 }).eq(0).click();
      cy.get(`[aria-label="Click to enable start"]`, { timeout: 5000 }).eq(0).click();
      cy.deletePlatformNotificationTemplate(notification, { failOnStatusCode: false });
    });
  });

  it('can toggle the Organizations -> Notification on and off for job success', () => {
    cy.createNotificationTemplate(notificationName, awxOrganization).then((notifier) => {
      notification = notifier;
      cy.filterTableByTextFilter('name', awxOrganization.name, { disableFilterSelection: true });
      cy.clickTableRowLink('name', awxOrganization.name, { disableFilter: true });
      cy.contains(awxOrganization.name);
      cy.contains(`a[role="tab"]`, 'Notifications').click();
      cy.filterTableByTextFilter('name', notificationName, { disableFilterSelection: true });
      cy.get(`[aria-label="Simple table"] tbody`)
        .find('tr')
        .contains(notificationName)
        .should('have.length', 1);
      cy.get(`[aria-label="Click to enable success"]`).click();
      cy.get(`[aria-label="Click to disable success"]`, { timeout: 5000 }).click();
      cy.get(`[aria-label="Click to enable success"]`, { timeout: 5000 });
      cy.deletePlatformNotificationTemplate(notification, { failOnStatusCode: false });
    });
  });

  it('can toggle the Organizations -> Notification on and off for job failure', () => {
    cy.createNotificationTemplate(notificationName, awxOrganization).then((notifier) => {
      notification = notifier;
      cy.filterTableByTextFilter('name', awxOrganization.name, { disableFilterSelection: true });
      cy.clickTableRowLink('name', awxOrganization.name, { disableFilter: true });
      cy.contains(awxOrganization.name);
      cy.contains(`a[role="tab"]`, 'Notifications').click();
      cy.filterTableByTextFilter('name', notificationName, { disableFilterSelection: true });
      cy.get(`[aria-label="Simple table"] tbody`)
        .find('tr')
        .contains(notificationName)
        .should('have.length', 1);
      cy.get(`[aria-label="Click to enable failure"]`).click();
      cy.get(`[aria-label="Click to disable failure"]`, { timeout: 5000 }).click();
      cy.get(`[aria-label="Click to enable failure"]`, { timeout: 5000 });
      cy.deletePlatformNotificationTemplate(notification, { failOnStatusCode: false });
    });
  });
});
