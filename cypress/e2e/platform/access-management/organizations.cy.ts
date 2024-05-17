import { randomString } from '../../../../framework/utils/random-string';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';

describe('Organizations - create, edit and delete', () => {
  const organizationName = 'Platform E2E Organization ' + randomString(4);
  const listEditedOrganizationName = `edited Organization ${randomString(4)}`;
  const detailsEditedOrganizationName = `edited Organization ${randomString(4)}`;
  let organization: PlatformOrganization;

  beforeEach(() => {
    cy.platformLogin();
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
    cy.get('[data-cy="create-organization"]').click();
    cy.get('[data-cy="name"]').type(organizationName);
    cy.clickButton(/^Create organization$/);
    cy.verifyPageTitle(organizationName);
    cy.clickPageAction('delete-organization');
    cy.get('#confirm').click();
    cy.intercept('DELETE', gatewayV1API`/organizations/*`).as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete');
  });

  it('renders the organization details page', () => {
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.getByDataCy('name-column-cell').contains(organization.name).click();
    cy.verifyPageTitle(organization.name);
    cy.clickLink(/^Details$/);
    cy.contains('#name', organization.name);
  });

  it('edits an organization from the list view', () => {
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.getByDataCy('edit-organization').click();
    cy.verifyPageTitle('Edit organization');
    cy.get('[data-cy="name"]').clear().type(`${listEditedOrganizationName} from list page`);
    const orgId = `${organization.id}`.toString();
    cy.intercept('PATCH', gatewayV1API`/organizations/${orgId}`).as('edited');
    cy.clickButton(/^Save organization$/);
    cy.wait('@edited')
      .its('response.body.name')
      .then((editedName) => {
        cy.verifyPageTitle('Organizations');
        cy.clickButton(/^Clear all filters$/);
        cy.filterTableByTextFilter('name', `${editedName}`, { disableFilterSelection: true });
        cy.getByDataCy('name-column-cell').should('contain', `${editedName}`);
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
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('edits an organization from the details view', () => {
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.getByDataCy('name-column-cell').contains(organization.name).click();
    cy.verifyPageTitle(organization.name);
    cy.get('[data-cy="edit-organization"]').click();
    cy.verifyPageTitle('Edit organization');
    cy.get('[data-cy="name"]').clear().type(`${detailsEditedOrganizationName} from details page`);
    const orgId = `${organization.id}`.toString();
    cy.intercept('PATCH', gatewayV1API`/organizations/${orgId}`).as('edited');
    cy.clickButton(/^Save organization$/);
    cy.wait('@edited')
      .its('response.body.name')
      .then((editedName) => {
        cy.verifyPageTitle(`${editedName}`);
      });
  });

  it('bulk create and delete organization from the organizations list toolbar', () => {
    let testOrganization1: PlatformOrganization;
    let testOrganization2: PlatformOrganization;
    cy.createPlatformOrganization().then((organization: PlatformOrganization) => {
      testOrganization1 = organization;
      cy.createPlatformOrganization().then((organization: PlatformOrganization) => {
        testOrganization2 = organization;
        cy.selectTableRow(testOrganization1.name);
        cy.clearAllFilters();
        cy.selectTableRow(testOrganization2.name);
        cy.clickToolbarKebabAction('delete-selected-organizations');
        cy.intercept('DELETE', gatewayV1API`/organizations/${testOrganization1.id.toString()}/`).as(
          'edaPlatformOrg1'
        );
        cy.intercept('DELETE', gatewayV1API`/organizations/${testOrganization1.id.toString()}/`).as(
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
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});

describe('Platform Teams - Users, Admins, Teams and EE tabs', function () {
  let organization: PlatformOrganization;

  beforeEach(() => {
    cy.platformLogin();
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

  // Organizations Users tab
  it('can add a user and apply the roles to the users of an organization via the users tab', function () {
    cy.createPlatformUser().then((createdUser1) => {
      cy.createPlatformUser().then((createdUser2) => {
        cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
        cy.clickTableRowLink('name', organization.name, { disableFilter: true });
        cy.clickTab('Users', true);
        cy.getByDataCy('add-users').click();
        cy.verifyPageTitle('Add roles');
        cy.getWizard().within(() => {
          cy.selectTableRowByCheckbox('username', createdUser1.username);
          cy.selectTableRowByCheckbox('username', createdUser2.username);
          cy.clickButton(/^Next/);
          cy.contains('h1', 'Select Automation Execution roles').should('be.visible');
          cy.filterTableByTextFilter('name', 'Organization Organization Admin', {
            disableFilterSelection: true,
          });
          cy.selectTableRowByCheckbox('name', 'Organization Organization Admin', {
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
            ['Editor', 'Has create and edit permissions.'],
            '1'
          );
          cy.verifyReviewStepWizardDetails(
            'awxRoles',
            [
              'Organization Organization Admin',
              'Has all permissions to organizations within an organization',
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
        cy.getModal().within(() => {
          cy.clickButton(/^Close$/);
        });
        cy.getModal().should('not.exist');
        cy.verifyPageTitle(organization.name);
        cy.selectTableRowByCheckbox('username', createdUser1.username);
        cy.selectTableRowByCheckbox('username', createdUser2.username);
        cy.clickToolbarKebabAction('remove-selected-users');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.get('#submit').click();
          cy.contains(/^Success$/).should('be.visible');
          cy.containsBy('button', /^Close$/).click();
        });
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });

  // Organizations Administrators tab
  it('can add and remove users as administrators to the organization from the administrators tab', function () {
    cy.createPlatformUser().then((user) => {
      // Organization Page
      cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
      cy.clickTableRowLink('name', organization.name, { disableFilter: true });

      // Organization - Administrators Tab
      cy.clickTab('Administrators', true);

      // Add Administrator
      cy.getByDataCy('add-administrators').click();
      cy.getModal().within(() => {
        cy.selectTableRowByCheckbox('username', user.username);
        cy.getBy('#submit').click();
      });
      cy.getModal().should('not.exist');

      // Remove Administrator
      cy.clickTableRowAction('username', user.username, 'remove-administrator', {
        inKebab: true,
      });
      cy.getModal().within(() => {
        cy.getBy('#confirm').click();
        cy.getBy('#submit').click();
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');

      // Clean up
      cy.deletePlatformUser(user, { failOnStatusCode: false });
    });
  });

  // Create team from teams tab
  it('can create a team from the teams tab, add an organization and assert it is added', function () {
    // Organization Page
    cy.filterTableByTextFilter('name', organization.name, { disableFilterSelection: true });
    cy.clickTableRowLink('name', organization.name, { disableFilter: true });

    // Organization - Teams Tab
    cy.clickTab('Teams', true);

    // Create Team
    const teamName = `E2E PlatformTeam ${randomString(4)}`;
    cy.intercept('POST', gatewayV1API`/teams/`).as('createTeam');
    cy.getByDataCy('create-team').click();
    cy.get('[data-cy="name"]').type(teamName);
    cy.singleSelectByDataCy('organization', organization.name);
    cy.clickButton(/^Create team$/);

    // Team Details
    cy.verifyPageTitle(teamName);
    cy.hasDetail('Organization', organization.name);

    // Delete Team
    cy.clickPageAction('delete-team');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete team/);

    // Clean up
    cy.wait('@createTeam')
      .its('response.body')
      .then((team: PlatformTeam) => {
        cy.deletePlatformTeam(team, { failOnStatusCode: false });
      });
  });
});