import { Organization } from '../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../frontend/awx/interfaces/User';
import { Team } from '../../../frontend/awx/interfaces/Team';
import { ExecutionEnvironment } from '../../../frontend/awx/interfaces/ExecutionEnvironment';
import { randomString } from '../../../framework/utils/random-string';
import { awxAPI } from '../../support/formatApiPathForAwx';

// There's an issue with upstream which prevents testing but everything is working on downstream so for now this test is moved to downstream only folder
describe('Execution Environments: Team access', () => {
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

  it('Add a team role assignment from the Team Access tab', () => {
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
});
