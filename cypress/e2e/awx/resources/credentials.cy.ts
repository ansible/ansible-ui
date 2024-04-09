/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('credentials', () => {
  let organization: Organization;
  let credential: Credential;
  let user: AwxUser;

  before(() => {
    cy.awxLogin();

    cy.requestPost<Organization>(awxAPI`/organizations/`, {
      name: 'E2E Credentials ' + randomString(4),
    }).then((testOrg) => {
      organization = testOrg;
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
      });
    });
  });

  beforeEach(() => {
    cy.requestPost<Credential>(awxAPI`/credentials/`, {
      name: 'E2E Credential ' + randomString(4),
      credential_type: 1,
      organization: organization.id,
    }).then((testCredential) => {
      credential = testCredential;
      //Assign normal user the 'Use' role of the newly created credential
      cy.giveUserCredentialsAccess(credential.name, user.id, 'Use');
    });
    cy.navigateTo('awx', 'credentials');
  });

  afterEach(() => {
    cy.requestDelete(awxAPI`/credentials/${credential.id.toString()}/`, {
      failOnStatusCode: false,
    });
  });

  after(() => {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.requestDelete(awxAPI`/organizations/${organization.id.toString()}/`, {
      failOnStatusCode: false,
    });
  });

  it('credentials page', () => {
    cy.navigateTo('awx', 'credentials');
    cy.verifyPageTitle('Credentials');
  });

  it('create and delete credential', () => {
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.navigateTo('awx', 'credentials');
    cy.clickButton(/^Create credential$/);
    cy.get('[data-cy="name"]').type(credentialName);
    cy.selectDropdownOptionByResourceName('credential-type', 'Amazon Web Services');
    cy.singleSelectByDataCy('organization', organization.name);
    cy.clickButton(/^Create credential$/);
    cy.verifyPageTitle(credentialName);
    //delete created credential
    cy.clickPageAction('delete-credential');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.verifyPageTitle('Credentials');
  });

  it('credential details', () => {
    cy.navigateTo('awx', 'credentials');
    cy.filterTableByMultiSelect('name', [credential.name]);
    cy.clickTableRowLink('name', credential.name, {
      disableFilter: true,
    });
    cy.verifyPageTitle(credential.name);
    cy.clickLink(/^Details$/);
    cy.contains('#name', credential.name);
  });

  it('edit credential from row action', () => {
    cy.navigateTo('awx', 'credentials');
    cy.filterTableByMultiSelect('name', [credential.name]);
    cy.get(`[data-cy="row-id-${credential.id}"]`).within(() => {
      cy.get('[data-cy="edit-credential"]').click();
    });
    cy.verifyPageTitle('Edit Credential');
    cy.get('[data-cy="name"]').clear().type(`${credential.name} - edited`);
    cy.clickButton(/^Save credential$/);
    cy.clearAllFilters();
    cy.filterTableByMultiSelect('name', [`${credential.name} - edited`]);
    cy.clickTableRowLink('name', `${credential.name} - edited`, { disableFilter: true });
    cy.verifyPageTitle(`${credential.name} - edited`);
    cy.clickButton(/^Edit credential$/);
    cy.get('[data-cy="name"]').clear().type(`${credential.name}`);
    cy.clickButton(/^Save credential$/);
    cy.verifyPageTitle(credential.name);
  });

  it('credential details edit credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.filterTableByMultiSelect('name', [credential.name]);
    cy.clickTableRowLink('name', credential.name, {
      disableFilter: true,
    });
    cy.clickButton(/^Edit credential$/);
    cy.verifyPageTitle('Edit Credential');
    cy.get('[data-cy="name"]').type(credential.name + 'a');
    cy.clickButton(/^Save credential$/);
    cy.verifyPageTitle(`${credential.name}`);
  });

  it('credential details delete credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.filterTableByMultiSelect('name', [credential.name]);
    cy.clickTableRowLink('name', credential.name, {
      disableFilter: true,
    });
    cy.verifyPageTitle(credential.name);
    cy.clickPageAction('delete-credential');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.verifyPageTitle('Credentials');
  });

  it('credentials table row delete credential', () => {
    cy.navigateTo('awx', 'credentials');
    cy.filterTableByMultiSelect('name', [credential.name]);
    cy.clickTableRowKebabAction(credential.name, 'delete-credential', false);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('credentials toolbar delete credentials', () => {
    cy.navigateTo('awx', 'credentials');
    cy.filterTableByMultiSelect('name', [credential.name]);
    cy.selectTableRowByCheckbox('name', credential.name, { disableFilter: true });
    cy.clickToolbarKebabAction('delete-selected-credentials');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
