import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Credentials', () => {
  let organization: Organization;
  let credential: Credential;
  let user: AwxUser;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
      });
    });
  });

  beforeEach(() => {
    cy.createAWXCredential({
      kind: 'machine',
      organization: organization.id,
      credential_type: 1,
    }).then((cred) => {
      credential = cred;
      cy.giveUserCredentialsAccess(credential.name, user.id, 'Use');
    });
  });

  after(() => {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  afterEach(() => {
    cy.deleteAwxCredential(credential, { failOnStatusCode: false });
  });

  describe('Credentials: List View', () => {
    it('can create and delete a credential that renders a sub form', () => {
      const credentialName = 'E2E Credential ' + randomString(4);
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential$/);
      cy.get('[data-cy="name"]').type(credentialName);
      cy.selectDropdownOptionByResourceName('credential-type', 'Amazon Web Services');
      cy.get('[data-cy="username"]').type('username');
      cy.get('[data-cy="password"]').type('password');
      cy.singleSelectByDataCy('organization', organization.name);
      cy.intercept('POST', awxAPI`/credentials/`).as('newCred');
      cy.clickButton(/^Create credential$/);
      cy.wait('@newCred')
        .its('response.body')
        .then((newCred: Credential) => {
          expect(newCred.name).to.eql(credentialName);
          cy.verifyPageTitle(newCred.name);
          cy.contains('Access Key').should('be.visible');
          cy.get('[data-cy="access-key"]').contains('username');
          cy.contains('Secret Key').should('be.visible');
          cy.get('[data-cy="secret-key"]').contains('Encrypted');
          cy.contains('Organization').should('be.visible');
          cy.contains(organization.name);
          cy.clickPageAction('delete-credential');
          cy.get('#confirm').click();
          cy.intercept('DELETE', awxAPI`/credentials/${newCred.id.toString()}/`).as('deleted');
          cy.clickButton(/^Delete credential/);
          cy.wait('@deleted')
            .its('response')
            .then((deleted) => {
              expect(deleted?.statusCode).to.eql(204);
              cy.verifyPageTitle('Credentials');
            });
        });
    });

    it('edit credential type that renders a sub form', () => {
      const credentialName = 'E2E Credential ' + randomString(4);
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential$/);
      cy.get('[data-cy="name"]').type(credentialName);
      cy.selectDropdownOptionByResourceName('credential-type', 'Amazon Web Services');
      cy.get('[data-cy="username"]').type('username');
      cy.get('[data-cy="password"]').type('password');
      cy.singleSelectByDataCy('organization', organization.name);
      cy.clickButton(/^Create credential$/);
      cy.verifyPageTitle(credentialName);
      cy.get('[data-cy="name"]').contains(credentialName);
      cy.contains('Access Key').should('be.visible');
      cy.get('[data-cy="access-key"]').contains('username');
      cy.contains('Secret Key').should('be.visible');
      cy.get('[data-cy="secret-key"]').contains('Encrypted');
      cy.contains('Organization').should('be.visible');
      cy.contains(organization.name);
      cy.get('[data-cy="edit-credential"]').click();
      cy.verifyPageTitle('Edit Credential');
      const ModifiedCredentialName = credentialName + ' - edited';
      cy.get('[data-cy="name"]').type(ModifiedCredentialName);
      cy.get('[data-cy="username"]').clear().type('username');
      cy.get('[data-cy="password"]').clear().type('password');
      cy.get('[data-cy="security-token"]').type('security-token');
      cy.clickButton(/^Save credential$/);
      cy.get('[data-cy="name"]').contains(ModifiedCredentialName);
      cy.contains(ModifiedCredentialName).should('be.visible');
      cy.contains('Access Key').should('be.visible');
      cy.get('[data-cy="access-key"]').contains('username');
      cy.contains('Secret Key').should('be.visible');
      cy.get('[data-cy="secret-key"]').contains('Encrypted');
      cy.get('[data-cy="sts-token"]').contains('Encrypted');
      cy.contains('Organization').should('be.visible');
      // //delete created credential
      cy.clickPageAction('delete-credential');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential/);
      cy.verifyPageTitle('Credentials');
    });

    it.skip('can create and delete one of each kind of credential', () => {
      //Write this test in a loop to test the creation of each kind of credential
      //Assert the different required and non-required form fields that each cred has
      //Assert info on the details page following the POST request
      //Assert the deletion of the credential at the end of the test
    });

    it('can edit machine credential from the list row action', () => {
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

    it('can delete machine credential from the list row action', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.clickTableRowKebabAction(credential.name, 'delete-credential', false);
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/credentials/${credential.id.toString()}/`).as('deleted');
      cy.clickButton(/^Delete credential/);
      cy.wait('@deleted')
        .its('response')
        .then((deleted) => {
          expect(deleted?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
          cy.verifyPageTitle('Credentials');
        });
    });

    it('can delete machine credential from the list toolbar', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.selectTableRowByCheckbox('name', credential.name, { disableFilter: true });
      cy.clickToolbarKebabAction('delete-selected-credentials');
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/credentials/${credential.id.toString()}/`).as('deleted');
      cy.clickButton(/^Delete credential/);
      cy.wait('@deleted')
        .its('response')
        .then((deleted) => {
          expect(deleted?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
          cy.verifyPageTitle('Credentials');
        });
    });
  });

  describe('Credentials: Details View', () => {
    it('can edit machine credential from the details page', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.clickTableRowLink('name', credential.name, {
        disableFilter: true,
      });
      cy.clickButton(/^Edit credential$/);
      cy.verifyPageTitle('Edit Credential');
      cy.get('[data-cy="name"]')
        .clear()
        .type(credential.name + '-edited');
      cy.intercept('PATCH', awxAPI`/credentials/${credential.id.toString()}/`).as('edited');
      cy.clickButton(/^Save credential$/);
      cy.wait('@edited')
        .its('response.body')
        .then((edited: Credential) => {
          expect(edited.name).to.eql(credential.name + '-edited');
          cy.getByDataCy('name').should('contain', edited.name);
          cy.verifyPageTitle(edited.name);
        });
    });

    it('can delete a machine credential from the details page', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.clickTableRowLink('name', credential.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(credential.name);
      cy.clickPageAction('delete-credential');
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/credentials/${credential.id.toString()}/`).as('deleted');
      cy.clickButton(/^Delete credential/);
      cy.wait('@deleted')
        .its('response')
        .then((deleted) => {
          expect(deleted?.statusCode).to.eql(204);
          cy.verifyPageTitle('Credentials');
        });
    });
  });

  describe('Credentials: Templates View', () => {
    it.skip('can associate a cred with a newly created job template and view that JT on the templates tab of the cred', () => {
      //use the credential created in the beforeEach block
      //create a JT in this test and specifically associate the cred to it
      //visit the templates tab of the credential and assert the JT showing there
      //delete the JT at the end of this test
    });
  });
});
