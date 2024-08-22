import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { hubAPI } from '../../support/formatApiPathForHub';

describe.skip('Repositories user and team access tests', () => {
  let repository: Repository;
  before(() => {
    cy.createHubRepository().then((createdRepository) => {
      repository = createdRepository;
    });
  });

  after(() => {
    cy.deleteHubRepository(repository);
  });

  beforeEach(() => {
    cy.navigateTo('hub', 'repositories');
    cy.verifyPageTitle('Repositories');
    cy.filterTableBySingleText(repository.name);
    cy.clickTableRowLink('name', repository.name, { disableFilter: true });
    cy.verifyPageTitle(repository.name);
  });

  function removeRoleFromListRow(roleName: string) {
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
      cy.contains(/^Success$/).should('be.visible');
      cy.containsBy('button', /^Close$/).click();
    });
  }

  it('create a new repository, from the user access tab assign a user and apply role(s) to the user of the repository', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab('User Access', true);
      cy.getByDataCy('add-roles').click();
      cy.getWizard().within(() => {
        cy.selectTableRow(hubUser.username);
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
        cy.verifyReviewStepWizardDetails('users', [hubUser.username], '1');
        cy.verifyReviewStepWizardDetails(
          'hubRoles',
          ['galaxy.ansible_repository_owner', 'Manage ansible repositories.'],
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
      cy.verifyPageTitle(repository.name);
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.ansible_repository_owner');
      cy.deleteHubUser(hubUser, { failOnStatusCode: false });
    });
  });

  it('create a new repository, from the team access tab assign a user and apply role(s) to the team of the repository', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_team_assignments/`).as('teamRoleAssignment');
    cy.createHubTeam().then((hubTeam) => {
      cy.clickTab('Team Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');

      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.selectTableRow(hubTeam.name);
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
          'hubRoles',
          ['galaxy.ansible_repository_owner', 'Manage ansible repositories.'],
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
      cy.verifyPageTitle(repository.name);
      cy.selectTableRowByCheckbox('team-name', hubTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.ansible_repository_owner');
      cy.deleteHubTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
