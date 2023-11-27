/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('organizations', () => {
  before(() => {
    cy.awxLogin();
  });

  it('renders the organizations list page', () => {
    cy.navigateTo('awx', 'organizations');
    cy.verifyPageTitle('Organizations');
  });

  it('creates and then deletes a basic organization', () => {
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
});

describe('organizations edit and delete', function () {
  let organization: Organization;

  before(function () {
    cy.awxLogin();
  });

  beforeEach(function () {
    const stringRandom = randomString(4);
    const orgName = 'E2E Organization ' + `${stringRandom}`;
    cy.createAwxOrganization(orgName).then((testOrganization) => {
      organization = testOrganization;
    });
  });

  afterEach(function () {
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('edits an organization from the list view', function () {
    const stringRandom = randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.getTableRowByText(`${organization.name}`).within(() => {
      cy.get('#edit-organization').click();
    });
    cy.verifyPageTitle('Edit Organization');
    cy.get('[data-cy="organization-name"]')
      .clear()
      .type('now-edited ' + `${stringRandom}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle('now-edited ' + `${stringRandom}`);
    cy.get('[data-cy="edit-organization"]').click();
    cy.get('[data-cy="organization-name"]').clear().type(`${organization.name}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle(`${organization.name}`);
  });

  it('edits an organization from the details page', function () {
    const stringRandom = randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.clickTableRow(`${organization.name}`);
    cy.verifyPageTitle(`${organization.name}`);
    cy.clickButton(/^Edit organization$/);
    cy.verifyPageTitle('Edit Organization');
    cy.get('[data-cy="organization-name"]')
      .clear()
      .type('now-edited ' + `${stringRandom}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle('now-edited ' + `${stringRandom}`);
    cy.get('[data-cy="edit-organization"]').click();
    cy.get('[data-cy="organization-name"]').clear().type(`${organization.name}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle(`${organization.name}`);
  });

  it('deletes an organization from the details page', function () {
    cy.navigateTo('awx', 'organizations');
    cy.clickTableRow(organization.name);
    cy.verifyPageTitle(organization.name);
    cy.clickPageAction(/^Delete organization/);
    cy.get('#confirm').click();
    cy.intercept('DELETE', '/api/v2/organizations/*').as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete');
    cy.verifyPageTitle('Organizations');
  });

  it('deletes an organization from the organizations list row item', function () {
    cy.navigateTo('awx', 'organizations');
    cy.searchAndDisplayResource(organization.name);
    cy.get(`[data-cy="row-id-${organization.id}"]`).within(() => {
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="delete-organization"]').click();
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes an organization from the organizations list toolbar', function () {
    const endOfName = organization.name.split(' ').slice(-1).toString();
    cy.navigateTo('awx', 'organizations');
    cy.intercept(
      'GET',
      `/api/v2/organizations/?name__icontains=${endOfName}&order_by=name&page=1&page_size=10`
    ).as('orgResult');
    cy.searchAndDisplayResource(`${endOfName}`);
    cy.wait('@orgResult').then(() => {
      cy.get(`[data-cy="row-id-${organization.id}"]`).within(() => {
        cy.get('input').click();
      });
      cy.clickToolbarKebabAction(/^Delete selected organizations$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
