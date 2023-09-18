/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

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
    // Cleanup E2E organizations older than 20 minutes
    cy.requestGet<AwxItemsResponse<Organization>>(
      `/api/v2/organizations/?page_size=100&created__lt=${new Date(
        Date.now() - 20 * 60 * 1000
      ).toISOString()}&name__startswith=E2E`
    ).then((itemsResponse) => {
      for (const organization of itemsResponse.results) {
        cy.requestDelete(`/api/v2/organizations/${organization.id}/`, {
          failOnStatusCode: false,
        });
      }
    });
  });

  it('renders the organizations list page', () => {
    cy.navigateTo('awx', 'organizations');
    cy.hasTitle(/^Organizations$/);
  });

  it('creates and then deletes a basic organization', () => {
    const organizationName = 'E2E Organization ' + randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.clickLink(/^Create organization$/);
    cy.get('[data-cy="organization-name"]').type(organizationName);
    cy.clickButton(/^Create organization$/);
    cy.hasTitle(organizationName);
    cy.clickPageAction(/^Delete organization/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.hasTitle(/^Organizations$/);
  });

  it('renders the organization details page', () => {
    cy.navigateTo('awx', 'organizations');
    cy.clickTableRow(organization.name);
    cy.hasTitle(organization.name);
    cy.clickLink(/^Details$/);
    cy.contains('#name', organization.name);
  });

  it('edits an organization from the details page', () => {
    cy.navigateTo('awx', 'organizations');
    cy.clickTableRow(organization.name);
    cy.hasTitle(organization.name);
    cy.clickButton(/^Edit organization$/);
    cy.hasTitle(/^Edit Organization$/);
    cy.get('[data-cy="organization-name"]').type(organization.name + 'a');
    cy.clickButton(/^Save organization$/);
    cy.hasTitle(`${organization.name}a`);
  });

  it('deletes an organization from the details page', () => {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo('awx', 'organizations');
      cy.clickTableRow(testOrganization.name);
      cy.hasTitle(testOrganization.name);
      cy.clickPageAction(/^Delete organization/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.hasTitle(/^Organizations$/);
    });
  });

  it('navigates to the edit form from the organizations list row item', () => {
    cy.navigateTo('awx', 'organizations');
    cy.getTableRowByText(organization.name).within(() => {
      cy.get('#edit-organization').click();
    });
    cy.hasTitle(/^Edit Organization$/);
  });

  it('deletes an organization from the organizations list row item', () => {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo('awx', 'organizations');
      cy.clickTableRowKebabAction(testOrganization.name, /^Delete organization$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('deletes an organization from the organizations list toolbar', () => {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo('awx', 'organizations');
      cy.selectTableRow(testOrganization.name);
      cy.clickToolbarKebabAction(/^Delete selected organizations$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
