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
    cy.typeByLabel(/^Name$/, credentialName);
    cy.typeByLabel(/^Organization$/, organization.name);
    cy.selectByLabel(/^Credential type$/, 'Amazon Web Services');
    cy.clickButton(/^Create credential$/);
    cy.hasTitle(credentialName);
  });

  it('edit credential', () => {
    cy.clickRow(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.hasTitle(/^Edit credential$/);
    cy.typeByLabel(/^Name$/, credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.hasTitle(`${credential.name}a`);
  });

  it('credential details', () => {
    cy.clickRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', credential.name);
  });

  it('credential details edit credential', () => {
    cy.clickRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.hasTitle(/^Edit credential$/);
    cy.typeByLabel(/^Name$/, credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.hasTitle(`${credential.name}a`);
  });

  it('credential details delete credential', () => {
    cy.clickRow(credential.name);
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
    cy.clickRowAction(credential.name, /^Delete credential$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('credentials toolbar delete credentials', () => {
    cy.selectRow(credential.name);
    cy.clickToolbarAction(/^Delete selected credentials$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
