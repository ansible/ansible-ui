import { randomString } from '../../../../framework/utils/random-string';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';

describe('Organizations - create, edit and delete', () => {
  const organizationName = 'Platform E2E Organization ' + randomString(4);
  const listEditedOrganizationName = `edited Organization ${randomString(4)}`;
  const detailsEditedOrganizationName = `edited Organization ${randomString(4)}`;
  let organization: PlatformOrganization;

  before(() => {
    cy.platformLogin();
  });

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

describe('Platform Teams - Users, Admins and Teams tabs', function () {
  let organization: PlatformOrganization;

  before(() => {
    cy.platformLogin();
  });

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

  // tests for tabs Roles, Users, Administrators, and Resource Access

  // Users tab
  it.skip('can add and remove users to the team via the organization users tab', function () {
    // 1. creates a team with global organization and the users createdUser1 and createdUser2
    // 2. add user createdUser3 to the team from the users tab
    // 3. remove user createdUser1 from the team users tab list row items
  });

  // Administrators tab
  it('can add and remove users as administrators to the organization from the administrators tab', function () {
    // 1. creates an organization - createdPlatformOrg
    // 2. add user createdUser1 as administrators to the organization from the Administrators tab
    // 3. remove user createdUser2 as admin of the team from the Administrators tab list items

    cy.createPlatformOrganization().then((createdPlatformOrg) => {
      cy.createPlatformUser().then((createdUser1: PlatformUser) => {
        cy.filterTableByTextFilter('name', createdPlatformOrg.name, {
          disableFilterSelection: true,
        });
        cy.getByDataCy('name-column-cell').contains(createdPlatformOrg.name).click();
        cy.clickTab('Administrators', true);

        // search first user createdUser1 and add as admin
        cy.intercept('GET', gatewayV1API`/users/?order_by=username&page=1&page_size=10`).as(
          'getUsers'
        );
        cy.getByDataCy('add-administrators').click();

        // wait for the users call to be done done and load the users in the add admin modal
        cy.wait('@getUsers');
        cy.searchAndDisplayResourceInModalPlatform(createdUser1.username);
        cy.intercept(
          'GET',
          gatewayV1API`/users/?username__contains=${createdUser1.username}&order_by=username&page=1&page_size=10`
        ).as('getUsersAfterSearch');

        cy.wait('@getUsersAfterSearch');
        cy.intercept(
          'POST',
          gatewayV1API`/organizations/${createdPlatformOrg.id.toString()}/admins/associate`
        ).as('associateUser1AsAdmin');
        cy.intercept(
          'GET',
          gatewayV1API`/organizations/${createdPlatformOrg.id.toString()}/users/?order_by=username&page=1&page_size=10`
        ).as('getUsersList');
        cy.intercept(
          'GET',
          gatewayV1API`/organizations/${createdPlatformOrg.id.toString()}/admins/?order_by=username&page=1&page_size=10`
        ).as('getAdminsList');
        cy.selectItemFromLookupModalPlatform();
        cy.wait('@associateUser1AsAdmin')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
            cy.wait('@getAdminsList')
              .its('response.body.results')
              .then((results: PlatformUser[]) => {
                const admins = results?.map((user) => user.username);
                expect(admins).to.have.lengthOf(1);
                expect(admins[0]).to.equal(createdUser1.username);
                cy.get('tr[data-cy^="row-id-"]').should('have.length', 1);
              });
          });
        cy.intercept(
          'POST',
          gatewayV1API`/organizations/${createdPlatformOrg.id.toString()}/admins/disassociate`
        ).as('disassociateUser1AsAdmin');
        cy.clickTableRowKebabAction(createdUser1.username, 'remove-administrator', false);
        cy.clickModalConfirmCheckbox();
        cy.clickButton(/^Remove administrators/);
        cy.wait('@disassociateUser1AsAdmin')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
            cy.contains(/^Success$/);
            cy.clickButton(/^Close$/);
            cy.wait('@getAdminsList')
              .its('response.body.results')
              .then((results: PlatformUser[]) => {
                const admins = results?.map((user) => user.username);
                expect(admins).to.have.lengthOf(0);
              });
            cy.get('tr[data-cy^="row-id-"]').should('have.length', 0);
          });
        cy.deletePlatformUser(createdUser1, { failOnStatusCode: false });
        cy.deletePlatformOrganization(createdPlatformOrg, { failOnStatusCode: false });
      });
    });
  });

  // Create team from teams tab
  it('can create a team from the teams tab, add an organization and assert it is added', function () {
    // 1. creates an organization - createdPlatformOrg
    // 2. create a team - createdPlatformTeam from the Teams tab with the above organization
    // 3. verify the created team createdPlatformTeam is created and is added to the organization createdPlatformOrg
    cy.createPlatformOrganization().then((createdPlatformOrg) => {
      cy.filterTableByTextFilter('name', createdPlatformOrg.name, {
        disableFilterSelection: true,
      });
      cy.getByDataCy('name-column-cell').contains(createdPlatformOrg.name).click();
      cy.clickTab('Teams', true);
      const teamName = `E2E PlatformTeam ${randomString(4)}`;
      cy.intercept('POST', gatewayV1API`/teams/`).as('createTeam');
      cy.getByDataCy('create-team').click();
      cy.get('[data-cy="name"]').type(teamName);
      cy.singleSelectByDataCy('organization', `${createdPlatformOrg.name}`);
      cy.clickButton(/^Create team$/);
      cy.wait('@createTeam')
        .its('response.body')
        .then((createdPlatformTeam: PlatformTeam) => {
          cy.verifyPageTitle(teamName);
          cy.get('[data-cy="organization"]').should('have.text', createdPlatformOrg.name);
          cy.clickPageAction('delete-team');
          cy.intercept('DELETE', gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/`).as(
            'deleteTeam'
          );
          cy.get('#confirm').click();
          cy.clickButton(/^Delete team/);
          cy.wait('@deleteTeam')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
        });
      cy.deletePlatformOrganization(createdPlatformOrg, { failOnStatusCode: false });
    });
  });
});
