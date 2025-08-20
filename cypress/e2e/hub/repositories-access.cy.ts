import { Repository } from '@ansible/hub-ui/administration/repositories/Repository';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';

describe('Repositories user and team access tests', () => {
  let repository: Repository;
  let organization: PlatformOrganization;
  before(() => {
    cy.createHubRepository().then((createdRepository) => {
      repository = createdRepository;
    });
    cy.createPlatformOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteHubRepository(repository);
    cy.deletePlatformOrganization(organization);
  });

  beforeEach(() => {
    cy.navigateTo('hub', 'repositories');
    cy.verifyPageTitle('Repositories');
    cy.filterTableBySingleText(repository.name);
    cy.clickTableRowLink('name', repository.name, { disableFilter: true });
    cy.verifyPageTitle(repository.name);
  });

  it('create a new repository, from the user access tab assign a user and apply role(s) to the user of the repository', () => {
    cy.intercept('POST', gatewayAPI`/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab(/^Details$/, true);
      cy.clickTab(/^User Access$/, true);
      cy.getByDataCy('assign-users').click();
      cy.getWizard().within(() => {
        cy.filterTableByTextFilter('name', hubUser.username, { disableFilterSelection: true });
        cy.getTableRowByText(hubUser.username, false).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
        cy.clickButton(/^Next/);
        cy.wait('@roleDefinitions');
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.ansible_repository_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.ansible_repository_owner', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('users', [hubUser.username], '1');
        cy.verifyReviewStepWizardDetails(
          'platformRoles',
          ['galaxy.ansible_repository_owner', 'Manage ansible repositories.', 'Automation Content'],
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
      cy.verifyPageTitle(repository.name);
    });
  });
  function removeRoleFromListRow(roleName: string) {
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
      //cy.contains(/^Success$/).should('be.visible');
    });
  }
  it('create a new repository, from the team access tab assign a user and apply role(s) to the team of the repository', () => {
    cy.intercept('POST', gatewayAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.createPlatformTeam({ organization: organization?.id }).then((hubTeam) => {
      cy.clickTab(/^Details$/, true);
      cy.clickTab(/^Team Access$/, true);
      cy.getByDataCy('assign-teams').click();
      cy.verifyPageTitle('Assign teams');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.filterTableByTextFilter('name', hubTeam.name, {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', hubTeam.name, {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.ansible_repository_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.ansible_repository_owner', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('teams', [hubTeam.name], '1');
        cy.verifyReviewStepWizardDetails(
          'platformRoles',
          ['galaxy.ansible_repository_owner', 'Manage ansible repositories.', 'Automation Content'],
          '1'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@teamRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.intercept('GET', gatewayAPI`/role_team_assignments/*`).as('teams');
      cy.wait('@teams');
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(repository.name);
      cy.selectTableRowByCheckbox('team-name', hubTeam.name, {
        disableFilter: false,
      });
      cy.contains('galaxy.ansible_repository_owner').should('be.visible');
      removeRoleFromListRow('galaxy.ansible_repository_owner');
      cy.deletePlatformTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
