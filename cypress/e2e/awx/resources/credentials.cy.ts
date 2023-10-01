/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('credentials', () => {
  let organization: Organization;
  let credential: Credential;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearAllSessionStorage();
    cy.awxLogin();

    cy.createAwxOrganization().then((testOrg) => (organization = testOrg));
    cy.createAWXCredential({
      name: 'E2E Credential ' + randomString(4),
      kind: 'machine',
      organization: organization.id,
      credential_type: 1,
    }).then((testCredential) => (credential = testCredential));
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
    cy.awxRequestDelete(`/api/v2/credentials/${credential.id}/`, { failOnStatusCode: false });
  });

  it('credentials page', () => {
    cy.navigateTo('awx', 'credentials');
    cy.verifyPageTitle('Credentials');
  });

  it('create credential', () => {
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.navigateTo('awx', 'credentials');
    cy.clickButton(/^Create credential$/);
    cy.get('[data-cy="name"]').type(credentialName);
    cy.get('[data-cy="summary-fields-organization-name"]').type(organization.name);
    cy.selectDropdownOptionByResourceName('credential-type', 'Amazon Web Services');
    cy.clickButton(/^Create credential$/);
    cy.verifyPageTitle(credentialName);
  });

  it('edit credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.clickTableRow(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.verifyPageTitle('Edit Credential');
    cy.get('[data-cy="name"]').type(credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.verifyPageTitle(`${credential.name}a`);
  });

  it('credential details', () => {
    cy.navigateTo('awx', 'credentials');
    cy.clickTableRow(credential.name);
    cy.verifyPageTitle(credential.name);
    cy.clickLink(/^Details$/);
    cy.contains('#name', credential.name);
  });

  it('credential details edit credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.clickTableRow(credential.name);
    cy.verifyPageTitle(credential.name);
    cy.clickButton(/^Edit credential$/);
    cy.verifyPageTitle('Edit Credential');
    cy.get('[data-cy="name"]').type(credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.verifyPageTitle(`${credential.name}a`);
  });

  it('credential details delete credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.clickTableRow(credential.name);
    cy.verifyPageTitle(credential.name);
    cy.clickPageAction(/^Delete credential/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.verifyPageTitle('Credentials');
  });

  it('credentials table row edit credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.clickTableRowPinnedAction(credential.name, 'Edit credential');
    cy.verifyPageTitle('Edit Credential');
  });

  it('credentials table row delete credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.clickTableRowKebabAction(credential.name, /^Delete credential$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('credentials toolbar delete credentials', () => {
    cy.navigateTo('awx', 'credentials');
    cy.selectTableRow(credential.name);
    cy.clickToolbarKebabAction(/^Delete selected credentials$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
