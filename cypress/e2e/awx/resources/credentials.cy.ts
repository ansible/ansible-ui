/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('credentials', () => {
  let organization: Organization;
  let credential: Credential;

  before(() => {
    cy.awxLogin();

    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Credentials ' + randomString(4),
    }).then((testOrg) => (organization = testOrg));
  });

  after(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, { failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.requestPost<Credential>('/api/v2/credentials/', {
      name: 'E2E Credential ' + randomString(4),
      credential_type: 1,
      organization: organization.id,
    }).then((testCredential) => (credential = testCredential));
    cy.navigateTo('awx', 'credentials');
  });

  afterEach(() => {
    cy.requestDelete(`/api/v2/credentials/${credential.id}/`, { failOnStatusCode: false });
  });

  it('credentials page', () => {
    cy.hasTitle(/^Credentials$/);
  });

  it('create credential', () => {
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.clickButton(/^Create credential$/);
    cy.get('[data-cy="name"]').type(credentialName);
    cy.get('[data-cy="summary_fields-organization-name"]').type(organization.name);
    cy.selectDropdownOptionByLabel(/^Credential type$/, 'Amazon Web Services');
    cy.clickButton(/^Create credential$/);
    cy.hasTitle(credentialName);
  });

  it('edit credential', () => {
    cy.clickTableRow(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.hasTitle(/^Edit Credential$/);
    cy.get('[data-cy="name"]').type(credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.hasTitle(`${credential.name}a`);
  });

  it('credential details', () => {
    cy.clickTableRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickLink(/^Details$/);
    cy.contains('#name', credential.name);
  });

  it('credential details edit credential', () => {
    cy.clickTableRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.hasTitle(/^Edit Credential$/);
    cy.get('[data-cy="name"]').type(credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.hasTitle(`${credential.name}a`);
  });

  it('credential details delete credential', () => {
    cy.clickTableRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickPageAction(/^Delete credential/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.hasTitle(/^Credentials$/);
  });

  it('credentials table row edit credential', () => {
    cy.clickTableRowPinnedAction(credential.name, 'Edit credential');
    cy.hasTitle(/^Edit Credential$/);
  });

  it('credentials table row delete credential', () => {
    cy.clickTableRowKebabAction(credential.name, /^Delete credential$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('credentials toolbar delete credentials', () => {
    cy.selectTableRow(credential.name);
    cy.clickToolbarKebabAction(/^Delete selected credentials$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
