/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { ItemsResponse } from '../../../../frontend/common/crud/Data';

describe('organizations', () => {
  let organization: Organization;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
    // Sometimes if tests are stopped in the middle, we get left over organizations
    // Cleanup E2E organizations older than 2 hours
    cy.requestGet<ItemsResponse<Organization>>(
      `/api/v2/organizations/?limit=100&created__lt=${new Date(
        Date.now() - 2 * 60 * 60 * 1000
      ).toISOString()}&name__startswith=E2E`
    ).then((itemsResponse) => {
      for (const organization of itemsResponse.results) {
        cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
      }
    });
  });

  it('renders the organizations list page', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.hasTitle(/^Organizations$/);
  });

  it('creates and then deletes a basic organization', () => {
    const organizationName = 'E2E Organization ' + randomString(4);
    cy.navigateTo(/^Organizations$/, false);
    cy.clickLink(/^Create organization$/);
    cy.typeByLabel(/^Name$/, organizationName);
    cy.clickButton(/^Create organization$/);
    cy.hasTitle(organizationName);
    // Clean up this organization
    cy.clickPageAction(/^Delete organization/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.hasTitle(/^Organizations$/);
  });

  it('renders the organization details page', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRow(organization.name);
    cy.hasTitle(organization.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', organization.name);
  });

  it('edits an organization from the details page', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRow(organization.name);
    cy.hasTitle(organization.name);
    cy.clickButton(/^Edit organization$/);
    cy.hasTitle(/^Edit organization$/);
    cy.typeByLabel(/^Name$/, 'a');
    cy.clickButton(/^Save organization$/);
    cy.hasTitle(`${organization.name}a`);
  });

  it('deletes an organization from the details page', () => {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo(/^Organizations$/, false);
      cy.clickRow(testOrganization.name);
      cy.hasTitle(testOrganization.name);
      cy.clickPageAction(/^Delete organization/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.hasTitle(/^Organizations$/);
    });
  });

  it('navigates to the edit form from the organizations list row item', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRowAction(organization.name, /^Edit organization$/);
    cy.hasTitle(/^Edit organization$/);
  });

  it('deletes an organization from the organizations list row item', () => {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo(/^Organizations$/, false);
      cy.clickRowAction(testOrganization.name, /^Delete organization$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('deletes an organization from the organizations list toolbar', () => {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo(/^Organizations$/, false);
      cy.selectRow(testOrganization.name);
      cy.clickToolbarAction(/^Delete selected organizations$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
