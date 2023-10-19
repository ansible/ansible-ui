/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('organizations', function () {
  before(function () {
    cy.awxLogin();
  });

  it('renders the organizations list page', function () {
    cy.navigateTo('awx', 'organizations');
    cy.verifyPageTitle('Organizations');
  });

  it('creates and then deletes a basic organization', function () {
    const organizationName = 'E2E Organization ' + randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.clickLink(/^Create organization$/);
    cy.get('[data-cy="organization-name"]').type(organizationName);
    cy.clickButton(/^Create organization$/);
    cy.verifyPageTitle(organizationName);
    cy.clickPageAction(/^Delete organization/);
    cy.get('#confirm').click();
    cy.intercept('DELETE', '/api/v2/organizations/*').as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete');
    cy.verifyPageTitle('Organizations');
  });

  it('renders the organization details page', function () {
    cy.navigateTo('awx', 'organizations');
    cy.clickTableRow(`${(this.globalProjectOrg as Organization).name}`);
    cy.verifyPageTitle(`${(this.globalProjectOrg as Organization).name}`);
    cy.clickLink(/^Details$/);
    cy.contains('#name', `${(this.globalProjectOrg as Organization).name}`);
  });

  it('edits an organization from the details page', function () {
    cy.navigateTo('awx', 'organizations');
    cy.clickTableRow(`${(this.globalProjectOrg as Organization).name}`);
    cy.verifyPageTitle(`${(this.globalProjectOrg as Organization).name}`);
    cy.clickButton(/^Edit organization$/);
    cy.verifyPageTitle('Edit Organization');
    cy.get('[data-cy="organization-name"]').type(
      `${(this.globalProjectOrg as Organization).name}` + 'a'
    );
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle(`${(this.globalProjectOrg as Organization).name}a`);
  });

  it('deletes an organization from the details page', function () {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo('awx', 'organizations');
      cy.clickTableRow(testOrganization.name);
      cy.verifyPageTitle(testOrganization.name);
      cy.clickPageAction(/^Delete organization/);
      cy.get('#confirm').click();
      cy.intercept('DELETE', '/api/v2/organizations/*').as('delete');
      cy.clickButton(/^Delete organization/);
      cy.wait('@delete');
      cy.verifyPageTitle('Organizations');
    });
  });

  it('navigates to the edit form from the organizations list row item', function () {
    cy.navigateTo('awx', 'organizations');
    cy.getTableRowByText(`${(this.globalProjectOrg as Organization).name}`).within(() => {
      cy.get('#edit-organization').click();
    });
    cy.verifyPageTitle('Edit Organization');
  });

  it('deletes an organization from the organizations list row item', function () {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo('awx', 'organizations');
      cy.searchAndDisplayResource(testOrganization.name);
      cy.get(`[data-cy="row-id-${testOrganization.id}"]`).within(() => {
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('[data-cy="delete-organization"]').click();
      });
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });

  it('deletes an organization from the organizations list toolbar', function () {
    cy.createAwxOrganization().then((testOrganization) => {
      cy.navigateTo('awx', 'organizations');
      // cy.searchAndDisplayResource(testOrganization.name);
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
