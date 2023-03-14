/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { ItemsResponse } from '../../../../frontend/Data';

describe('organizations', () => {
  let organization: Organization;

  before(() => {
    cy.awxLogin();
  });

  after(() => {
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

  beforeEach(() => {
    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Organization ' + randomString(4),
    }).then((testOrganization) => (organization = testOrganization));
  });

  afterEach(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
  });

  it('organization page', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.hasTitle(/^Organizations$/);
  });

  it('create organization', () => {
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

  it('organization details', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRow(organization.name);
    cy.hasTitle(organization.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', organization.name);
  });

  it('organization details edit organization', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRow(organization.name);
    cy.hasTitle(organization.name);
    cy.clickButton(/^Edit organization$/);
    cy.hasTitle(/^Edit organization$/);
    cy.typeByLabel(/^Name$/, 'a');
    cy.clickButton(/^Save organization$/);
    cy.hasTitle(`${organization.name}a`);
  });

  it('organization details delete organization', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRow(organization.name);
    cy.hasTitle(organization.name);
    cy.clickPageAction(/^Delete organization/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.hasTitle(/^Organizations$/);
  });

  it('organizations table row edit organization', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRowAction(organization.name, /^Edit organization$/);
    cy.hasTitle(/^Edit organization$/);
  });

  it('organizations table row delete organization', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.clickRowAction(organization.name, /^Delete organization$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('organizations toolbar delete organizations', () => {
    cy.navigateTo(/^Organizations$/, false);
    cy.selectRow(organization.name);
    cy.clickToolbarAction(/^Delete selected organizations$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
