import { randomString } from '../../../../framework/utils/random-string';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Execution Environments: User/Team access', () => {
  let organization: Organization;
  let user: AwxUser;
  let team: Team;
  let execEnv: ExecutionEnvironment;
  const execEnvName = 'E2E Execution Environment Create' + randomString(4);
  const image = 'quay.io/ansible/awx-ee:latest';

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });
      cy.createAwxTeam({ organization: organization.id }).then((testTeam) => {
        team = testTeam;
      });
      cy.createAwxExecutionEnvironment({
        name: execEnvName,
        organization: organization.id,
        image: image,
      }).then((createdEE) => {
        execEnv = createdEE;
      });
    });
  });

  after(() => {
    cy.deleteAwxExecutionEnvironment(execEnv, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxTeam(team, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('Add a user role assignment from the User Access tab', () => {
    cy.addEERolesToUsersInOrganization(organization.name);
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.intercept('POST', awxAPI`/role_user_assignments/`).as('userRoleAssignment');
    cy.filterTableByMultiSelect('name', [execEnvName]);
    cy.clickTableRowLink('name', execEnvName, { disableFilter: true });
    cy.hasDetail('Name', execEnv.name);
    cy.clickTab(/^User Access$/, true);

    cy.getByDataCy('add-roles').click();
    cy.verifyPageTitle('Add roles');
    cy.getWizard().within(() => {
      cy.contains('h1', 'Select user(s)').should('be.visible');
      cy.selectTableRowByCheckbox('username', user.username);
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
        'awxRoles',
        ['ExecutionEnvironment Admin', 'Has all permissions to a single execution environment'],
        '1'
      );
      cy.clickButton(/^Finish/);
      cy.wait('@userRoleAssignment')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
    });
    cy.getModal().within(() => {
      cy.clickButton(/^Close$/);
    });
    cy.getModal().should('not.exist');
    cy.verifyPageTitle(execEnvName);

    cy.getByDataCy('select-all').click();
    cy.clickToolbarKebabAction('remove-roles');
    cy.contains('Remove role');
    cy.clickModalConfirmCheckbox();
    cy.clickButton(/^Remove role$/);
    cy.clickButton(/^Close$/);
  });

  // There's inconsistency with Users -> creating a team with an org doesn't show it under the org so skipping for time being
  it.skip('Add a team role assignment from the Team Access tab', () => {
    cy.addEERolesToTeamsInOrganization(organization.name);
    cy.navigateTo('awx', 'execution-environments');
    cy.verifyPageTitle('Execution Environments');
    cy.intercept('POST', awxAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.filterTableByMultiSelect('name', [execEnvName]);
    cy.clickTableRowLink('name', execEnvName, { disableFilter: true });
    cy.hasDetail('Name', execEnvName);
    cy.clickTab(/^Team Access$/, true);

    cy.getByDataCy('add-roles').click();
    cy.verifyPageTitle('Add roles');
    cy.getWizard().within(() => {
      cy.contains('h1', 'Select team(s)').should('be.visible');
      cy.filterTableByMultiSelect('name', [team.name]);
      cy.selectTableRowByCheckbox('name', team.name, { disableFilter: true });
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
        'awxRoles',
        ['ExecutionEnvironment Admin', 'Has all permissions to a single execution environment'],
        '1'
      );
      cy.clickButton(/^Finish/);
      cy.wait('@teamRoleAssignment')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(201);
        });
    });
    cy.getModal().within(() => {
      cy.clickButton(/^Close$/);
    });
    cy.getModal().should('not.exist');
    cy.verifyPageTitle(execEnvName);

    cy.getByDataCy('select-all').click();
    cy.clickToolbarKebabAction('remove-roles');
    cy.contains('Remove role');
    cy.clickModalConfirmCheckbox();
    cy.clickButton(/^Remove role$/);
    cy.clickButton(/^Close$/);
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
