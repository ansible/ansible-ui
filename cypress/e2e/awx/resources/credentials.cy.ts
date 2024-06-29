import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';
import { tag } from '../../../support/tag';

describe('Credentials', () => {
  let user: AwxUser;
  let project: Project;
  let awxOrganization: Organization;
  let credential: Credential;

  before(function () {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
        cy.createAwxUser({ organization: awxOrganization.id }).then((testUser) => {
          user = testUser;
        });
      });
    });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Credentials: List View', () => {
    beforeEach(() => {
      cy.createAWXCredential({
        kind: 'machine',
        organization: awxOrganization.id,
        credential_type: 1,
      }).then((cred) => {
        credential = cred;
      });
    });

    afterEach(() => {
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    });

    it('can edit machine credential from the list row action', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.get(`[data-cy="row-id-${credential.id}"]`).within(() => {
        cy.getByDataCy('edit-credential').click();
      });
      cy.verifyPageTitle('Edit Credential');
      cy.getByDataCy('name').clear().type(`${credential.name} - edited`);
      cy.clickButton(/^Save credential$/);
      cy.clearAllFilters();
      cy.filterTableByMultiSelect('name', [`${credential.name} - edited`]);
      cy.clickTableRowLink('name', `${credential.name} - edited`, { disableFilter: true });
      cy.verifyPageTitle(`${credential.name} - edited`);
      cy.clickButton(/^Edit credential$/);
      cy.getByDataCy('name').clear().type(`${credential.name}`);
      cy.clickButton(/^Save credential$/);
      cy.verifyPageTitle(credential.name);
      cy.deleteAwxCredential(credential);
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

    it('copies a credential from the list row action', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('copy-credential').click();
      });
      cy.getByDataCy('alert-toaster').contains('copied').should('be.visible');
      cy.clickButton(/^Clear all filters/);
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
      cy.filterTableByMultiSelect('name', [`${credential.name} @`]);
      cy.getByDataCy('checkbox-column-cell').within(() => {
        cy.get('input').click();
      });
      cy.clickToolbarKebabAction('delete-selected-credentials');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete credential/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
      });
    });
  });

  describe('Credentials: Details View', () => {
    beforeEach(() => {
      cy.createAWXCredential({
        name: 'E2E Credential ' + randomString(4),
        kind: 'Centrify Vault Credential Provider Lookup',
        organization: awxOrganization.id,
        credential_type: 25,
        inputs: { url: 'http://foo.com', client_id: 'foo', client_password: 'foo' },
      }).then((cred) => {
        credential = cred;
      });
    });

    afterEach(() => {
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    });

    it('renders the details page boolean field', () => {
      const credentialName = 'E2E Credential ' + randomString(4);
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential$/);
      cy.getByDataCy('name').type(credentialName);
      cy.singleSelectBy('[data-cy="credential_type"]', 'Container Registry');
      cy.contains('Type Details').should('be.visible');
      cy.getByDataCy('host').clear().type('https://host.com');
      cy.getByDataCy('verify_ssl').check();
      cy.clickButton(/^Create credential$/);
      cy.verifyPageTitle(credentialName);
      cy.getByDataCy('name').contains(credentialName);
      cy.contains('Authentication URL').should('be.visible');
      cy.getByDataCy('authentication-url').contains('https://host.com');
      cy.contains('Verify SSL').should('be.visible');
      cy.getByDataCy('verify-ssl').contains('Yes');
      cy.clickPageAction('delete-credential');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential/);
      cy.verifyPageTitle('Credentials');
    });

    it('can edit machine credential from the details page', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.clickTableRowLink('name', credential.name, {
        disableFilter: true,
      });
      cy.clickButton(/^Edit credential$/);
      cy.verifyPageTitle('Edit Credential');
      cy.getByDataCy('name')
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
          cy.clickPageAction('delete-credential');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete credential/);
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

  describe('Credentials Create: External test modal', () => {
    it('can display error toast message when running a test from the create credential form', () => {
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential/);
      cy.getByDataCy('name').type('foo');
      cy.getByDataCy('credential_type').click();
      cy.getByDataCy('centrify-vault-credential-provider-lookup').click();
      cy.getByDataCy('url').type('http://foo.com');
      cy.getByDataCy('client-id').type('foo');
      cy.getByDataCy('client-password').type('foo');
      cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.get('button').contains('Run').should('have.attr', 'aria-disabled', 'false').click();
      cy.getByDataCy('alert-toaster')
        .should('be.visible')
        .and('contain', 'Something went wrong with the request to test this credential.')
        .within(() => {
          cy.get('button').click();
        });
      cy.clickModalButton('Cancel');
      cy.clickButton(/^Cancel/);
    });

    it('can display success toast message when running a test from the create credential form', () => {
      cy.intercept('POST', awxAPI`/credential_types/25/test`, {}).as('runTest');
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential/);
      cy.getByDataCy('name').type('foo');
      cy.getByDataCy('credential_type').click();
      cy.getByDataCy('centrify-vault-credential-provider-lookup').click();
      cy.getByDataCy('url').type('http://foo.com');
      cy.getByDataCy('client-id').type('foo');
      cy.getByDataCy('client-password').type('foo');
      cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.get('button').contains('Run').should('have.attr', 'aria-disabled', 'false').click();
      cy.wait('@runTest');
      cy.getByDataCy('alert-toaster')
        .should('be.visible')
        .and('contain', 'Test passed.')
        .within(() => {
          cy.get('button').click();
        });
      cy.clickModalButton('Cancel');
      cy.clickButton(/^Cancel/);
    });
  });

  describe('Credentials Edit: External test modal', () => {
    before(() => {
      cy.createAWXCredential({
        name: 'E2E Credential ' + randomString(4),
        kind: 'Centrify Vault Credential Provider Lookup',
        organization: awxOrganization.id,
        credential_type: 25,
        inputs: { url: 'http://foo.com', client_id: 'foo', client_password: 'foo' },
      }).then((cred) => {
        credential = cred;
      });
    });

    after(() => {
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    });

    it('can display error toast message when running a test from the edit credential form', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.clickTableRowAction('name', credential.name, 'edit-credential', { disableFilter: true });
      cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.get('button').contains('Run').should('have.attr', 'aria-disabled', 'false').click();
      cy.getByDataCy('alert-toaster')
        .should('be.visible')
        .and('contain', 'Something went wrong with the request to test this credential.')
        .within(() => {
          cy.get('button').click();
        });
      cy.clickModalButton('Cancel');
      cy.clickButton(/^Cancel/);
    });

    it('can display success toast message when running a test from the edit credential form', () => {
      cy.intercept('POST', awxAPI`/credentials/${credential.id.toString()}/test`, {}).as('runTest');
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [credential.name]);
      cy.clickTableRowAction('name', credential.name, 'edit-credential', { disableFilter: true });
      cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.get('button').contains('Run').should('have.attr', 'aria-disabled', 'false').click();
      cy.wait('@runTest');
      cy.getByDataCy('alert-toaster')
        .should('be.visible')
        .and('contain', 'Test passed.')
        .within(() => {
          cy.get('button').click();
        });
      cy.clickModalButton('Cancel');
      cy.clickButton(/^Cancel/);
    });
  });

  describe('Create Credentials of different types', () => {
    type MockCredentialData = {
      name: string;
      required?: Array<{ field: string; dataCy: string }>;
      fields?: Array<{ id: string; value: string; dataCy: string }>;
    };

    // FLAKY_06_13_2024
    it('can create credentials with 30 different credential types', function () {
      cy.fixture<MockCredentialData[]>('credentialsTestData').as('createCredentials');
      cy.get('@createCredentials').then((fixture) => {
        const credentialTypes = fixture as unknown as MockCredentialData[];
        cy.intercept('GET', awxAPI`/credential_types/?page=1&page_size=200`).as(
          'getCredentialTypes'
        );
        cy.navigateTo('awx', 'credentials');
        credentialTypes.forEach((item) => {
          const credentialName = `E2E Credential ${randomE2Ename()}`;
          cy.getByDataCy('create-credential').click();
          cy.verifyPageTitle('Create Credential');
          cy.getByDataCy('name').should('be.visible').type(credentialName);
          cy.wait('@getCredentialTypes').then(() => {
            cy.singleSelectByDataCy('credential_type', `${item.name}`, true);
            if (Array.isArray(item.required)) {
              (item.required as { field: string; dataCy: string }[]).forEach((credentialType) => {
                switch (item.name) {
                  case 'HashiCorp Vault Secret Lookup':
                    cy.get(`[data-cy="${credentialType.dataCy}"]`).type(`${credentialType.field}`);
                    cy.selectDropdownOptionByResourceName('api-version', 'v1');
                    break;
                  case 'Ansible Galaxy/Automation Hub API Token':
                    cy.singleSelectByDataCy('organization', awxOrganization.name);
                    cy.get(`[data-cy="${credentialType.dataCy}"]`).type(`${credentialType.field}`);
                    break;
                  case 'GPG Public Key':
                    cy.get('#gpg-public-key').type(`${credentialType.field}`);
                    break;
                  case 'Terraform backend configuration':
                    cy.get('[data-cy="configuration-form-group"]').type(`${credentialType.field}`);
                    break;
                  default:
                    cy.get(`[data-cy="${credentialType.dataCy}"]`).type(`${credentialType.field}`);
                }
              });
            }
            cy.intercept('POST', awxAPI`/credentials/`).as('created');
            cy.getByDataCy('Submit').click();
            cy.wait('@created');
            cy.verifyPageTitle(credentialName);
            cy.clickPageAction('delete-credential');
            cy.get('#confirm').click();
            cy.clickButton(/^Delete credential/);
            cy.verifyPageTitle('Credentials');
          });
        });
      });
    });

    describe('Credentials: Credential Types Tests', () => {
      it('can create credential using custom credential type', () => {
        cy.createAwxCredentialType().then((credType) => {
          const credentialName = 'E2E Credential ' + randomString(4);
          cy.navigateTo('awx', 'credentials');
          cy.clickButton(/^Create credential$/);
          cy.getByDataCy('name').type(credentialName);
          cy.singleSelectBy('[data-cy="credential_type"]', credType.name, true);
          cy.clickButton(/^Create credential$/);
          cy.verifyPageTitle(credentialName);
          cy.getByDataCy('name').contains(credentialName);
          //delete created credential
          cy.clickPageAction('delete-credential');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete credential/);
          cy.verifyPageTitle('Credentials');
          cy.deleteAwxCredentialType(credType);
        });
      });

      it('cannot edit vault id field for Vault credential type', () => {
        const credentialName = 'E2E Credential ' + randomString(4);
        cy.navigateTo('awx', 'credentials');
        cy.clickButton(/^Create credential$/);
        cy.getByDataCy('name').type(credentialName);
        cy.singleSelectBy('[data-cy="credential_type"]', 'Vault', true);
        cy.contains('Type Details').should('be.visible');
        cy.getByDataCy('vault-password').type('password');
        cy.getByDataCy('vault-id').type('id');
        cy.singleSelectByDataCy('organization', awxOrganization.name);
        cy.clickButton(/^Create credential$/);
        cy.verifyPageTitle(credentialName);
        cy.getByDataCy('name').contains(credentialName);
        cy.contains('Vault Identifier').should('be.visible');
        cy.getByDataCy('vault-identifier').contains('id');
        cy.contains('Vault Password').should('be.visible');
        cy.getByDataCy('vault-password').contains('Encrypted');
        cy.getByDataCy('edit-credential').click();
        cy.verifyPageTitle('Edit Credential');
        cy.get('[data-cy="vault-password"]').then(($pwd) => {
          cy.wrap($pwd).should('have.value', 'ENCRYPTED');
        });
        cy.getByDataCy('ask_vault_password').check();
        cy.clickButton(/^Save credential$/);
        cy.getByDataCy('name').contains(credentialName);
        cy.contains('Vault Identifier').should('be.visible');
        cy.getByDataCy('vault-identifier').contains('id');
        cy.contains('Vault Password').should('be.visible');
        cy.getByDataCy('vault-password').contains('Prompt on launch');
        //delete created credential
        cy.clickPageAction('delete-credential');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete credential/);
        cy.verifyPageTitle('Credentials');
      });
    });
  });

  describe('Credentials: Sub Form Testing', () => {
    it('can create and delete a credential that renders a sub form', () => {
      const credentialName = 'E2E Credential ' + randomString(4);
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential$/);
      cy.getByDataCy('name').type(credentialName);
      cy.singleSelectByDataCy('credential_type', 'Amazon Web Services');
      cy.contains('Type Details').should('be.visible');
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.getByDataCy('username').type('username');
      cy.getByDataCy('password').type('password');
      cy.getByDataCy('security-token').type('security-token');
      cy.getByDataCy('description').type('description');
      cy.intercept('POST', awxAPI`/credentials/`).as('newCred');
      cy.clickButton(/^Create credential$/);
      cy.wait('@newCred')
        .its('response.body')
        .then((newCred: Credential) => {
          cy.getByDataCy('name').contains(credentialName);
          cy.getByDataCy('label-credential-type').contains('Credential type');
          cy.getByDataCy('credential-type').contains('Amazon Web Services');
          cy.getByDataCy('label-access-key').contains('Access Key');
          cy.getByDataCy('access-key').contains('username');
          cy.getByDataCy('label-secret-key').contains('Secret Key');
          cy.getByDataCy('secret-key').contains('Encrypted');
          cy.getByDataCy('label-sts-token').contains('STS Token');
          cy.getByDataCy('label-organization').contains('Organization');
          cy.getByDataCy('organization').contains(awxOrganization.name);
          cy.getByDataCy('label-description').contains('Description');
          cy.getByDataCy('description').contains('description');
          cy.getByDataCy('edit-credential').click();
          cy.verifyPageTitle('Edit Credential');
          const ModifiedCredentialName = credentialName + ' - edited';
          cy.getByDataCy('name').type(ModifiedCredentialName);
          cy.get('input[data-cy="username"]').then(($username) => {
            cy.wrap($username).should('have.value', 'username');
          });
          cy.get('input[data-cy="password"]').then(($pwd) => {
            cy.wrap($pwd).should('have.value', 'ENCRYPTED');
          });
          cy.get('input[data-cy="security-token"]').then(($token) => {
            cy.wrap($token).should('have.value', 'ENCRYPTED');
          });
          const newDescription = 'new description';
          cy.getByDataCy('description').clear().type(newDescription);
          cy.clickButton(/^Save credential$/);
          cy.getByDataCy('name').contains(ModifiedCredentialName);
          cy.getByDataCy('label-credential-type').contains('Credential type');
          cy.getByDataCy('credential-type').contains('Amazon Web Services');
          cy.getByDataCy('label-access-key').contains('Access Key');
          cy.getByDataCy('access-key').contains('username');
          cy.getByDataCy('label-secret-key').contains('Secret Key');
          cy.getByDataCy('secret-key').contains('Encrypted');
          cy.getByDataCy('label-sts-token').contains('STS Token');
          cy.getByDataCy('sts-token').contains('Encrypted');
          cy.getByDataCy('label-description').contains('Description');
          cy.getByDataCy('description').contains(newDescription);
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

    it.skip('can edit credential type that renders a sub form', () => {
      const credentialName = 'E2E Credential ' + randomString(4);
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential$/);
      cy.get('[data-cy="name"]').type(credentialName);
      cy.singleSelectBy('[data-cy="credential_type"]', 'Amazon Web Services');
      cy.contains('Type Details').should('be.visible');
      cy.get('[data-cy="username"]').type('username');
      cy.get('[data-cy="password"]').type('password');
      cy.get('[data-cy="security-token"]').type('security-token');
      cy.get('[data-cy="description"]').type('description');
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.clickButton(/^Create credential$/);
      cy.verifyPageTitle(credentialName);
      cy.get('[data-cy="name"]').contains(credentialName);
      cy.contains('Access Key').should('be.visible');
      cy.get('[data-cy="access-key"]').contains('username');
      cy.contains('Secret Key').should('be.visible');
      cy.get('[data-cy="secret-key"]').contains('Encrypted');
      cy.contains('Organization').should('be.visible');
      cy.contains(awxOrganization.name);
      cy.get('[data-cy="edit-credential"]').click();
      cy.verifyPageTitle('Edit Credential');
      const ModifiedCredentialName = credentialName + ' - edited';
      cy.get('[data-cy="name"]').type(ModifiedCredentialName);
      cy.get('[data-cy="username"]').should('be.visible');
      cy.get('[data-cy="username"]').then(($input) => {
        expect($input.val()).to.eq('username');
      });
      cy.get('[data-cy="password"]').should('be.visible');
      cy.get('[data-cy="password"]').then(($input) => {
        expect($input.val()).to.eq('ENCRYPTED');
      });
      cy.get('[data-cy="security-token"]').should('be.visible');
      cy.get('[data-cy="security-token"]').then(($input) => {
        expect($input.val()).to.eq('ENCRYPTED');
      });
      const newDescription = 'new description';
      cy.get('[data-cy="description"]').clear().type(newDescription);
      cy.clickButton(/^Save credential$/);
      cy.get('[data-cy="name"]').contains(ModifiedCredentialName);
      cy.contains(ModifiedCredentialName).should('be.visible');
      cy.contains('Access Key').should('be.visible');
      cy.get('[data-cy="access-key"]').contains('username');
      cy.contains('Secret Key').should('be.visible');
      cy.get('[data-cy="secret-key"]').contains('Encrypted');
      cy.get('[data-cy="sts-token"]').contains('Encrypted');
      cy.contains('Organization').should('be.visible');
      cy.contains('Description').should('be.visible');
      cy.get('[data-cy="description"]').contains(newDescription);
      cy.clickPageAction('delete-credential');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential/);
      cy.verifyPageTitle('Credentials');
    });
  });

  describe('Credentials: Miscellaneous Testing', () => {
    it('can create/edit a credential using prompt on launch', () => {
      const credentialName = 'E2E Credential ' + randomString(4);
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential$/);
      cy.getByDataCy('name').type(credentialName);
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.singleSelectBy('[data-cy="credential_type"]', 'Machine');
      cy.contains('Type Details').should('be.visible');
      cy.getByDataCy('ask_password').check();
      cy.getByDataCy('ask_ssh_key_unlock').check();
      cy.clickButton(/^Create credential$/);
      cy.verifyPageTitle(credentialName);
      cy.getByDataCy('name').contains(credentialName);
      cy.contains('Private Key Passphrase').should('be.visible');
      cy.getByDataCy('private-key-passphrase').contains('Prompt on launch');
      cy.contains('Password').should('be.visible');
      cy.getByDataCy('password').contains('Prompt on launch');
      cy.getByDataCy('edit-credential').click();
      cy.verifyPageTitle('Edit Credential');
      cy.getByDataCy('ask_password').uncheck();
      cy.getByDataCy('password').type('password');
      cy.clickButton(/^Save credential$/);
      cy.contains('Password').should('be.visible');
      cy.getByDataCy('password').contains('Encrypted');
      cy.contains('Private Key Passphrase').should('be.visible');
      cy.getByDataCy('private-key-passphrase').contains('Prompt on launch');
      cy.clickPageAction('delete-credential');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential/);
      cy.verifyPageTitle('Credentials');
    });

    it('should render privilege escalation for machine credential type', () => {
      // This is a test for the custom component that renders the privilege
      // escalation method using a custom component
      const credentialName = 'E2E Credential ' + randomString(4);
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential$/);
      cy.getByDataCy('name').type(credentialName);
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.singleSelectBy('[data-cy="credential_type"]', 'Machine');
      cy.contains('Type Details').should('be.visible');
      // Use custom component to render the privilege escalation method is sudo
      cy.contains('Privilege Escalation Method ').should('be.visible');
      cy.get('button[aria-label="Options menu"]').click();
      cy.getByDataCy('select-option-sudo').click();
      cy.clickButton(/^Create credential$/);
      cy.verifyPageTitle(credentialName);
      cy.getByDataCy('name').contains(credentialName);
      cy.contains('Privilege Escalation Method').should('be.visible');
      cy.getByDataCy('privilege-escalation-method').contains('sudo');
      cy.clickPageAction('delete-credential');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential/);
      cy.verifyPageTitle('Credentials');
    });
  });

  describe('Credentials Tabbed View - Job Templates', () => {
    let machineCredential: Credential;
    let awxInventory: Inventory;

    beforeEach(() => {
      cy.createAWXCredential({
        kind: 'machine',
        organization: awxOrganization.id,
        credential_type: 1,
      }).then((cred) => {
        machineCredential = cred;
      });
      cy.createAwxInventory(awxOrganization).then((inv) => {
        awxInventory = inv;
      });
    });

    afterEach(() => {
      cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
      cy.deleteAwxInventory(awxInventory, { failOnStatusCode: false });
    });

    it('can create a job template within the context of credential job template tab', function () {
      const jobTemplateName = `E2E Job Template ${randomE2Ename()}`;
      cy.intercept('POST', awxAPI`/job_templates`).as('createJT');
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [machineCredential.name]);
      cy.clickTableRowLink('name', machineCredential.name, { disableFilter: true });
      cy.clickTab('Job Templates', true);
      cy.getByDataCy('create-template').click();
      cy.verifyPageTitle('Create Job Template');
      cy.getByDataCy('name').type(jobTemplateName);
      cy.selectDropdownOptionByResourceName('inventory', awxInventory.name);
      cy.selectDropdownOptionByResourceName('project', `${project.name}`);
      cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
      cy.selectItemFromLookupModal('credential-select', machineCredential.name);
      cy.getByDataCy('Submit').click();
    });
  });
});

tag(['upstream'], () => {
  //these tests will not work downstream
  describe('Credentials Tabbed View - Team and User Access', () => {
    let machineCredential: Credential;
    let createdAwxUser: AwxUser;
    let awxOrganization: Organization;
    let awxTeam: Team;

    beforeEach(() => {
      cy.createAwxOrganization().then((awxOrg) => {
        awxOrganization = awxOrg;
        cy.createAwxUser({ organization: awxOrganization.id }).then((awxUser) => {
          createdAwxUser = awxUser;
          cy.createAWXCredential({
            kind: 'machine',
            organization: awxOrganization.id,
            credential_type: 1,
          }).then((cred) => {
            machineCredential = cred;
          });
        });
        cy.createAwxTeam({ organization: awxOrganization.id }).then((createdAwxTeam) => {
          awxTeam = createdAwxTeam;
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
      cy.deleteAwxUser(createdAwxUser, { failOnStatusCode: false });
      cy.deleteAwxTeam(awxTeam, { failOnStatusCode: false });
      cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
    });

    function removeRoleFromListRow(roleName: string, assignmentType: string) {
      cy.intercept('DELETE', awxAPI`/role_${assignmentType}_assignments/*`).as('deleteRole');
      cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Remove role/);
        cy.wait('@deleteRole')
          .its('response')
          .then((deleted) => {
            expect(deleted?.statusCode).to.eql(204);
            cy.contains(/^Success$/).should('be.visible');
            cy.containsBy('button', /^Close$/).click();
          });
      });
    }

    it('can create a new credential, assign a team and apply role(s)', () => {
      cy.intercept('POST', awxAPI`/role_team_assignments/`).as('teamRoleAssignment');
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [machineCredential.name]);
      cy.clickTableRowLink('name', machineCredential.name, { disableFilter: true });
      cy.clickTab('Team Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.filterTableByMultiSelect('name', [awxTeam.name]);
        cy.selectTableRowByCheckbox('name', awxTeam.name, { disableFilter: true });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'Credential Admin', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'Credential Admin', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'Credential Use', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'Credential Use', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('teams', [awxTeam.name], '1');
        cy.verifyReviewStepWizardDetails(
          'awxRoles',
          [
            'Credential Admin',
            'Has all permissions to a single credential',
            'Credential Use',
            'Has use permissions to a single credential',
          ],
          '2'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@teamRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(machineCredential.name);
      cy.selectTableRowByCheckbox('team-name', awxTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('Credential Admin', 'team');
      cy.selectTableRowByCheckbox('team-name', awxTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('Credential Use', 'team');
    });

    it('can create a new credential, assign a user and apply role(s)', () => {
      cy.intercept('POST', awxAPI`/role_user_assignments/`).as('userRoleAssignment');
      cy.navigateTo('awx', 'credentials');
      cy.filterTableByMultiSelect('name', [machineCredential.name]);
      cy.clickTableRowLink('name', machineCredential.name, { disableFilter: true });
      cy.clickTab('User Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
        cy.selectTableRowByCheckbox('username', createdAwxUser.username);
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'Credential Admin', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'Credential Admin', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'Credential Use', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'Credential Use', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('users', [createdAwxUser.username], '1');
        cy.verifyReviewStepWizardDetails(
          'awxRoles',
          [
            'Credential Admin',
            'Has all permissions to a single credential',
            'Credential Use',
            'Has use permissions to a single credential',
          ],
          '2'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@userRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(machineCredential.name);
      cy.selectTableRowByCheckbox('username', createdAwxUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('Credential Admin', 'user');
      cy.selectTableRowByCheckbox('username', createdAwxUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('Credential Use', 'user');
    });
  });
});
