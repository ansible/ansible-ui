import { randomString } from '../../../../framework/utils/random-string';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';

describe('Organizations - create, edit and delete', () => {
  const organizationName = 'Platform E2E Organization ' + randomString(4);
  const listEditedOrganizationName = `edited Organization ${randomString(4)}`;
  const detailsEditedOrganizationName = `edited Organization ${randomString(4)}`;

  beforeEach(() => {
    cy.navigateTo('platform', 'organizations');
    cy.verifyPageTitle('Organizations');
  });

  before(() => {
    cy.platformLogin();
  });

  it('creates a basic organization', () => {
    cy.get('[data-cy="create-organization"]').click();
    cy.get('[data-cy="name"]').type(organizationName);
    cy.clickButton(/^Create organization$/);
    cy.verifyPageTitle(organizationName);
  });

  it('renders the organization details page', () => {
    cy.setTableView('table-view');
    cy.clickTableRow(organizationName);
    cy.verifyPageTitle(organizationName);
    cy.clickLink(/^Details$/);
    cy.contains('#name', organizationName);
  });

  it('edits an organization from the list view', () => {
    cy.getTableRowByText(organizationName).within(() => {
      cy.get('#edit-organization').click();
    });
    cy.verifyPageTitle('Edit organization');
    cy.get('[data-cy="name"]').clear().type(`${listEditedOrganizationName} from list page`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle('Organizations');
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes an organization from the organizations list view', () => {
    cy.clickTableRowKebabAction(
      `${listEditedOrganizationName} from list page`,
      'delete-organization'
    );
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('edits an organization from the details view', () => {
    cy.createPlatformOrganization().then((organization: PlatformOrganization) => {
      const orgName = organization?.name;
      cy.setTableView('table-view');
      cy.clickTableRow(orgName);
      cy.verifyPageTitle(orgName);
      cy.get('[data-cy="edit-organization"]').click();
      cy.verifyPageTitle('Edit organization');
      cy.get('[data-cy="name"]').clear().type(`${detailsEditedOrganizationName} from details page`);
      cy.clickButton(/^Save organization$/);
      cy.verifyPageTitle(`${detailsEditedOrganizationName} from details page`);
    });
  });

  it('deletes an organization from the organizations details page', () => {
    cy.clickTableRow(`${detailsEditedOrganizationName} from details page`);
    cy.verifyPageTitle(`${detailsEditedOrganizationName} from details page`);
    cy.clickLink(/^Details$/);
    cy.contains('#name', `${detailsEditedOrganizationName} from details page`);
    cy.clickPageAction('delete-organization');
    cy.get('#confirm').click();
    cy.intercept('DELETE', gatewayV1API`/organizations/*`).as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete');
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
