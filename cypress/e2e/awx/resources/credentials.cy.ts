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
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
  });

  beforeEach(() => {
    cy.requestPost<Credential>('/api/v2/credentials/', {
      name: 'E2E Credential ' + randomString(4),
      credential_type: 1,
      organization: organization.id,
    }).then((testCredential) => (credential = testCredential));
    cy.navigateTo(/^Credentials$/);
  });

  afterEach(() => {
    cy.requestDelete(`/api/v2/credentials/${credential.id}/`, true);
  });

  it('credentials page', () => {
    cy.hasTitle(/^Credentials$/);
  });

  it('create credential', () => {
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.clickButton(/^Create credential$/);
    cy.typeInputByLabel(/^Name$/, credentialName);
    cy.typeInputByLabel(/^Organization$/, organization.name);
    cy.selectDropdownOptionByLabel(/^Credential type$/, 'Amazon Web Services');
    cy.clickButton(/^Create credential$/);
    cy.hasTitle(credentialName);
  });

  it('edit credential', () => {
    cy.clickTableRow(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.hasTitle(/^Edit credential$/);
    cy.typeInputByLabel(/^Name$/, credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.hasTitle(`${credential.name}a`);
  });

  it('credential details', () => {
    cy.clickTableRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', credential.name);
  });

  it('credential details edit credential', () => {
    cy.clickTableRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.hasTitle(/^Edit credential$/);
    cy.typeInputByLabel(/^Name$/, credential.name + 'a');
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
    cy.get('button.edit-credential').first().click();
    cy.hasTitle(/^Edit credential$/);
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
