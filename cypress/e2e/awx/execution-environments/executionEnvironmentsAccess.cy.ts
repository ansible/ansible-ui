import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { ExecutionEnvironment } from '@ansible/awx-ui/interfaces/ExecutionEnvironment';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';

describe('Execution Environments: User/Team access', () => {
  let organization: PlatformOrganization;
  let awxOrganization: Organization;
  let user: PlatformUser;
  let team: PlatformTeam;
  let execEnv: ExecutionEnvironment;
  const execEnvName = 'E2E Execution Environment Create' + randomString(4);
  const image = 'quay.io/ansible/awx-ee:latest';

  before(() => {
    cy.createPlatformOrganization().then((org) => {
      organization = org;
      cy.getAwxOrgByAnsibleId(org.summary_fields.resource?.ansible_id).then((awxOrg) => {
        awxOrganization = awxOrg;
        cy.createPlatformUser().then((testUser) => {
          user = testUser;
        });
        cy.createPlatformTeam({ organization: organization?.id }).then((testTeam) => {
          team = testTeam;
        });
        cy.createAwxExecutionEnvironment({
          name: execEnvName,
          organization: awxOrganization?.id,
          image: image,
        }).then((createdEE) => {
          execEnv = createdEE;
        });
      });
    });
  });

  after(() => {
    cy.deleteAwxExecutionEnvironment(execEnv, { failOnStatusCode: false });
    cy.deletePlatformUser(user, { failOnStatusCode: false });
    cy.deletePlatformTeam(team, { failOnStatusCode: false });
    cy.deletePlatformOrganization(organization, { failOnStatusCode: false });
  });

  it.skip('Add a user role assignment from the User Access tab', () => {
    //skipping this test due to flakiness. Needs to be migrated to Playwright.
    cy.navigateTo('platform', 'organizations');
    cy.verifyPageTitle('Organizations');
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.clickTableRowLink('name', organization.name, { disableFilter: true });
    cy.clickTab(/^Users$/, true);
    cy.getByDataCy('assign-users').click();
    cy.filterTableByTextFilter('username', user?.username, {
      disableFilterSelection: true,
    });
    cy.selectTableRowByCheckbox('username', user?.username, {
      disableFilter: true,
    });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"]').should('contain.text', 'Review');
    cy.selectTableRowByCheckbox('name', 'Organization ExecutionEnvironment Admin', {
      disableFilter: false,
    });
    cy.get('[data-ouia-component-id="simple-table"]').within(() => {
      cy.get('tbody tr').should('have.length', 1);
    });
    cy.getByDataCy('Submit').click();
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.intercept('POST', gatewayAPI`/role_user_assignments/`).as('userRoleAssignment');

    cy.filterTableBySearch(execEnvName);
    cy.clickTableRowLink('name', execEnvName, { disableFilter: true });
    cy.hasDetail('Name', execEnvName);
    cy.clickTab(/^User Access$/, true);
    cy.getByDataCy('assign-users').click();
    cy.verifyPageTitle('Assign users');
    cy.getWizard().within(() => {
      cy.contains('h1', 'Select user(s)').should('be.visible');
      cy.filterTableByTextFilter('username', user.username, {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('username', user.username, {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Select roles to apply').should('be.visible');
      cy.filterTableByTextFilter('name', 'ExecutionEnvironment Admin', {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('name', 'ExecutionEnvironment Admin', {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Review').should('be.visible');
      cy.verifyReviewStepWizardDetails('users', [user.username], '1');
      cy.verifyReviewStepWizardDetails(
        'platformRoles',
        [
          'ExecutionEnvironment Admin',
          'Has all permissions to a single execution environment',
          'Automation Execution',
        ],
        '1'
      );
      cy.clickButton(/^Finish/);
      cy.wait('@userRoleAssignment')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
    });
    cy.getModal().should('not.exist');
    cy.verifyPageTitle(execEnvName);
    // This is a workaround for the issue:
    // https://issues.redhat.com/browse/AAP-31401
    cy.clickTab(/^Details$/, true);
    cy.clickTab(/^User Access$/, true);
  });

  it('Add a team role assignment from the Team Access tab', () => {
    cy.navigateTo('platform', 'organizations');
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.clickTableRowLink('name', organization.name, { disableFilter: true });
    cy.clickTab('Teams', true);
    cy.getByDataCy('assign-organization-roles').click();
    cy.verifyPageTitle('Assign organization roles');
    cy.getWizard().within(() => {
      cy.filterTableByTextFilter('name', team.name, {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('name', team.name, {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Select organization roles').should('be.visible');
      cy.filterTableByTextFilter('name', 'Organization ExecutionEnvironment Admin', {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('name', 'Organization ExecutionEnvironment Admin', {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Review').should('be.visible');
      cy.clickButton(/^Finish/);
    });
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.intercept('POST', gatewayAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.filterTableBySearch(execEnvName);
    cy.clickTableRowLink('name', execEnvName, { disableFilter: true });
    cy.hasDetail('Name', execEnvName);
    cy.clickTab(/^Team Access$/, true);
    cy.getByDataCy('assign-teams').click();
    cy.verifyPageTitle('Assign teams');
    cy.getWizard().within(() => {
      cy.contains('h1', 'Select team(s)').should('be.visible');
      cy.filterTableByTextFilter('name', team.name, {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('name', team.name, {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Select roles to apply').should('be.visible');
      cy.filterTableByTextFilter('name', 'ExecutionEnvironment Admin', {
        disableFilterSelection: true,
      });
      cy.selectTableRowByCheckbox('name', 'ExecutionEnvironment Admin', {
        disableFilter: true,
      });
      cy.clickButton(/^Next/);
      cy.contains('h1', 'Review').should('be.visible');
      cy.verifyReviewStepWizardDetails('teams', [team.name], '1');
      cy.verifyReviewStepWizardDetails(
        'platformRoles',
        [
          'ExecutionEnvironment Admin',
          'Has all permissions to a single execution environment',
          'Automation Execution',
        ],
        '1'
      );
      cy.clickButton(/^Finish/);
      cy.wait('@teamRoleAssignment')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
    });
    cy.getModal().should('not.exist');
    cy.verifyPageTitle(execEnvName);
    // This is a workaround for the issue:
    // https://issues.redhat.com/browse/AAP-31401
    cy.clickTab(/^Details$/, true);
    cy.clickTab(/^Team Access$/, true);
    cy.get('input[name="check-all"]').check();
    cy.clickToolbarKebabAction('remove-roles');
    cy.contains('Remove role');
    cy.clickModalConfirmCheckbox();
    cy.clickButton(/^Remove role$/);
    cy.contains('No teams assigned to execution environment').should('be.visible');
  });

  it('User and Team Access tabs are not present for managed EEs', () => {
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.clickTableRowLink('name', 'Control Plane Execution Environment', { disableFilter: true });
    cy.verifyPageTitle('Control Plane Execution Environment');
    cy.contains('a[role="tab"]', 'User Access').should('not.exist');
    cy.contains('a[role="tab"]', 'Team Access').should('not.exist');
  });
});
