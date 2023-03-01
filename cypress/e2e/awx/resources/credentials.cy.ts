/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('credentials', () => {
  let organization: Organization;
  let credential: Credential;
  let user1: User;
  let user2: User;

  before(() => {
    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Credentials ' + randomString(4),
    }).then((testOrg) => {
      organization = testOrg;
      // Create users for testing access UI
      cy.requestPost<User>(`/api/v2/organizations/${organization.id.toString()}/users/`, {
        username: 'e2e-user-' + randomString(4),
        is_superuser: false,
        is_system_auditor: false,
        password: 'pw',
        user_type: 'normal',
      }).then((testUser) => (user1 = testUser));
      cy.requestPost<User>(`/api/v2/organizations/${organization.id.toString()}/users/`, {
        username: 'e2e-user-' + randomString(4),
        is_superuser: false,
        is_system_auditor: false,
        password: 'pw',
        user_type: 'normal',
      }).then((testUser) => (user2 = testUser));
    });
  });

  after(() => {
    cy.requestDelete(`/api/v2/users/${user1.id}/`, true);
    cy.requestDelete(`/api/v2/users/${user2.id}/`, true);
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

  // it('edit credential', () => {
  //   cy.clickRow(credential.name);
  //   cy.clickButton(/^Edit credential$/);
  //   cy.hasTitle(/^Edit credential$/);
  //   cy.typeByLabel(/^Name$/, 'a');
  //   cy.clickButton(/^Save credential$/);
  //   cy.hasTitle(`${credential.name}a`);
  // });

  it('credential details', () => {
    cy.clickRow(credential.name);
    cy.hasTitle(credential.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', credential.name);
  });

  // it('credential access: add users using toolbar button', () => {
  //   cy.clickRow(credential.name);
  //   cy.hasTitle(credential.name);
  //   cy.clickTab(/^Access$/);
  //   // Add users to credential -> TODO: Replace with Wizard when it is ready
  //   cy.clickButton(/^Add users$/);
  //   cy.selectRowInDialog(user1.username);
  //   cy.selectRowInDialog(user2.username);
  //   cy.clickButton(/^Confirm$/);
  //   cy.contains(/^Success$/);
  //   cy.clickButton(/^Close$/);
  //   cy.getRowFromList(user1.username).should('be.visible');
  //   cy.getRowFromList(user2.username).should('be.visible');
  //   cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.member_role.id,
  //     disassociate: true,
  //   });
  //   cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.member_role.id,
  //     disassociate: true,
  //   });
  //   cy.clickButton(/^Clear all filters$/);
  // });

  // it('credential access: remove users using toolbar button', () => {
  //   cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.member_role.id,
  //   });
  //   cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.member_role.id,
  //   });
  //   cy.clickRow(credential.name);
  //   cy.hasTitle(credential.name);
  //   cy.clickTab(/^Access$/);
  //   // Remove users
  //   cy.selectRow(user1.username);
  //   cy.selectRow(user2.username);
  //   cy.clickButton(/^Remove users$/);
  //   cy.get('#confirm').click();
  //   cy.clickButton(/^Remove user/);
  //   cy.contains(/^Success$/);
  //   cy.clickButton(/^Close$/);
  //   cy.getRowFromList(user1.username).should('not.exist');
  //   cy.getRowFromList(user2.username).should('not.exist');
  //   cy.clickButton(/^Clear all filters$/);
  // });

  // it('credential access: remove a single user using the row action', () => {
  //   cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.member_role.id,
  //   });
  //   cy.clickRow(credential.name);
  //   cy.hasTitle(credential.name);
  //   cy.clickTab(/^Access$/);
  //   cy.clickRowAction(user1.username, /^Remove user$/);
  //   cy.get('#confirm').click();
  //   cy.clickButton(/^Remove user/);
  //   cy.contains(/^Success$/);
  //   cy.clickButton(/^Close$/);
  //   cy.clickButton(/^Clear all filters$/);
  //   cy.getRowFromList(user1.username).should('not.exist');
  //   cy.clickButton(/^Clear all filters$/);
  // });

  // it('credential access: remove a role from user', () => {
  //   cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.member_role.id,
  //   });
  //   cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.read_role.id,
  //   });
  //   cy.clickRow(credential.name);
  //   cy.hasTitle(credential.name);
  //   cy.clickTab(/^Access$/);
  //   cy.getRowFromList(user1.username).within(() => {
  //     cy.get(
  //       `div[data-ouia-component-id="Read-${credential.summary_fields.object_roles.read_role.id}"] button`
  //     ).click();
  //   });
  //   cy.contains('Remove User Access');
  //   cy.clickButton('Delete');
  //   cy.clickButton(/^Clear all filters$/);
  //   cy.getRowFromList(user1.username).within(() => {
  //     cy.get(
  //       `div[data-ouia-component-id="Read-${credential.summary_fields.object_roles.read_role.id}"]`
  //     ).should('not.exist');
  //   });
  //   cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
  //     id: credential.summary_fields.object_roles.member_role.id,
  //     disassociate: true,
  //   });
  // });

  // it('credential roles', () => {
  //   cy.clickRow(credential.name);
  //   cy.hasTitle(credential.name);
  //   cy.clickTab(/^Roles$/);
  // });

  // it('credential details edit credential', () => {
  //   cy.clickRow(credential.name);
  //   cy.hasTitle(credential.name);
  //   cy.clickButton(/^Edit credential$/);
  //   cy.hasTitle(/^Edit credential$/);
  //   cy.typeByLabel(/^Name$/, 'a');
  //   cy.clickButton(/^Save credential$/);
  //   cy.hasTitle(`${credential.name}a`);
  // });

  // it('credential details delete credential', () => {
  //   cy.clickRow(credential.name);
  //   cy.hasTitle(credential.name);
  //   cy.clickPageAction(/^Delete credential/);
  //   cy.get('#confirm').click();
  //   cy.clickButton(/^Delete credential/);
  //   cy.hasTitle(/^Credentials$/);
  // });

  it('credentials table row edit credential', () => {
    cy.get('#edit-credential').click();
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
