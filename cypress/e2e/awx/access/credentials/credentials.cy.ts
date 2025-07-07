/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { Team } from '@ansible/awx-ui/interfaces/Team';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { cyLabel } from '../../../../support/cyLabel';
import { awxAPI } from '../../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../../support/utils';

describe('Credentials', () => {
  let awxOrganization: Organization;
  let project: Project;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      awxOrganization = org;
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
      });
    });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Credentials: List View', () => {
    let credential: Credential;
    beforeEach(() => {
      cy.createAWXCredential(
        {
          kind: 'machine',
          organization: awxOrganization.id,
        },
        'Machine'
      ).then((cred) => {
        credential = cred;
      });
    });
    afterEach(() => {
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    });

    it('can edit machine credential from the list row action', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableBySearch(credential.name);
      cy.get(`[data-cy="row-id-${credential.id}"]`).within(() => {
        cy.getByDataCy('edit-credential').click();
      });
      cy.verifyPageTitle(`Edit ${credential.name}`);
      cy.getByDataCy('name').clear().type(`${credential.name} - edited`);
      cy.clickButton(/^Save credential$/);
      cy.clearAllFilters();
      cy.filterTableBySearch(`${credential.name} - edited`);
      cy.clickTableRowLink('name', `${credential.name} - edited`, { disableFilter: true });
      cy.verifyPageTitle(`${credential.name} - edited`);
      cy.clickButton(/^Edit credential$/);
      cy.getByDataCy('name').clear().type(`${credential.name}`);
      cy.clickButton(/^Save credential$/);
      cy.verifyPageTitle(credential.name);
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    });

    it('can delete machine credential from the list row action', () => {
      cy.navigateTo('awx', 'credentials');
      cy.intercept(awxAPI`/credentials/?search=*`).as('getSearchResults');
      cy.filterTableBySearch(credential.name);
      cy.wait('@getSearchResults');
      cy.clickTableRowAction('name', credential.name, 'delete-credential', {
        disableFilter: true,
        inKebab: true,
      });
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/credentials/${credential.id.toString()}/`).as('deleted');
      cy.clickButton(/^Delete credential/);
      cy.wait('@deleted')
        .its('response')
        .then((deleted) => {
          expect(deleted?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Clear all filters$/);
          cy.verifyPageTitle('Credentials');
        });
    });

    it('can delete machine credential from the list toolbar', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableBySearch(credential.name);
      cy.selectTableRowByCheckbox('name', credential.name, { disableFilter: true });
      cy.clickToolbarKebabAction('delete-credentials');
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/credentials/${credential.id.toString()}/`).as('deleted');
      cy.clickButton(/^Delete credential/);
      cy.wait('@deleted')
        .its('response')
        .then((deleted) => {
          expect(deleted?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Clear all filters$/);
          cy.verifyPageTitle('Credentials');
        });
    });

    it('copies a credential from the list row action', () => {
      cy.navigateTo('awx', 'credentials');
      cy.intercept(awxAPI`/credentials/?search=*`).as('getSearchResults');
      cy.filterTableBySearch(credential.name);
      cy.wait('@getSearchResults');
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('duplicate-credential').click();
      });
      cy.getByDataCy('alert-toaster').contains('duplicated').should('be.visible');
      cy.clickButton(/^Clear all filters/);
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
      cy.filterTableBySearch(`${credential.name} @`);
      cy.wait('@getSearchResults');
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('[data-cy="checkbox-column-cell"] input').click();
      });
      cy.clickToolbarKebabAction('delete-credentials');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete credential/);
        cy.contains(/^Success$/);
      });
    });
  });

  describe('Credentials: Details View', () => {
    let credential: Credential;
    beforeEach(() => {
      cy.createAWXCredential(
        {
          name: 'E2E Credential ' + randomString(4),
          kind: 'Centrify Vault Credential Provider Lookup',
          organization: awxOrganization.id,
          inputs: { url: 'http://foo.com', client_id: 'foo', client_password: 'foo' },
        },
        'Centrify Vault Credential Provider Lookup'
      ).then((cred) => {
        credential = cred;
      });
    });

    afterEach(() => {
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    });
    it('details page should render boolean field', () => {
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
      cy.filterTableBySearch(credential.name);
      cy.clickTableRowLink('name', credential.name, {
        disableFilter: true,
      });
      cy.clickButton(/^Edit credential$/);
      cy.verifyPageTitle(`Edit ${credential.name}`);
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
      cy.filterTableBySearch(credential.name);
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
      cy.contains('Test').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.contains('Run').click();
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
      cy.intercept('POST', awxAPI`/credential_types/*/test`, {}).as('runTest');
      cy.navigateTo('awx', 'credentials');
      cy.clickButton(/^Create credential/);
      cy.getByDataCy('name').type('foo');
      cy.getByDataCy('credential_type').click();
      cy.getByDataCy('centrify-vault-credential-provider-lookup').click();
      cy.getByDataCy('url').type('http://foo.com');
      cy.getByDataCy('client-id').type('foo');
      cy.getByDataCy('client-password').type('foo');
      cy.contains('Test').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.contains('Run').click();
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
    let credential: Credential;
    before(() => {
      cy.createAWXCredential(
        {
          name: 'E2E Credential ' + randomString(4),
          kind: 'Centrify Vault Credential Provider Lookup',
          organization: awxOrganization.id,
          inputs: { url: 'http://foo.com', client_id: 'foo', client_password: 'foo' },
        },
        'Centrify Vault Credential Provider Lookup'
      ).then((cred) => {
        credential = cred;
      });
    });

    after(() => {
      cy.deleteAwxCredential(credential, { failOnStatusCode: false });
    });

    it('can display error toast message when running a test from the edit credential form', () => {
      cy.navigateTo('awx', 'credentials');
      cy.filterTableBySearch(credential.name);
      cy.clickTableRowAction('name', credential.name, 'edit-credential', { disableFilter: true });
      cy.contains('Test').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.contains('Run').click();
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
      cy.filterTableBySearch(credential.name);
      cy.clickTableRowAction('name', credential.name, 'edit-credential', { disableFilter: true });
      cy.contains('Test').click();
      cy.contains('Test external credential').should('be.visible');
      cy.getByDataCy('account-name').type('foo');
      cy.getByDataCy('system-name').type('foo');
      cy.contains('Run').click();
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

  describe('Credentials Tabbed View - Job Templates', () => {
    let machineCredential: Credential;
    let awxOrganization: Organization;
    let awxInventory: Inventory;

    beforeEach(() => {
      cy.createAwxOrganization().then((awxOrg) => {
        awxOrganization = awxOrg;
        cy.createAWXCredential(
          {
            kind: 'machine',
            organization: awxOrganization.id,
          },
          'Machine'
        ).then((cred) => {
          machineCredential = cred;
        });

        cy.createAwxInventory(awxOrganization).then((inv) => {
          awxInventory = inv;
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
      cy.deleteAwxInventory(awxInventory, { failOnStatusCode: false });
      cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
    });

    it('can create a job template within the context of credential job template tab', () => {
      const jobTemplateName = `E2E Job Template ${randomE2Ename()}`;
      cy.intercept('POST', awxAPI`/job_templates`).as('createJT');
      cy.navigateTo('awx', 'credentials');
      cy.filterTableBySearch(machineCredential.name);
      cy.clickTableRowLink('name', machineCredential.name, { disableFilter: true });
      cy.clickTab('Job Templates', true);
      cy.clickLink(/^Create template$/);
      cy.verifyPageTitle('Create job template');
      cy.getByDataCy('name').type(jobTemplateName);
      cy.singleSelectBy('[data-cy="inventory"]', awxInventory.name);
      cy.selectAsyncSingleSelectOption('project-select', `${project.name}`);
      cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
      cy.multiSelectByDataCy('credential', [machineCredential.name]);
      cy.getByDataCy('Submit').click();
    });
  });
});

describe('Credentials: Credential Types Tests', () => {
  let organization: Organization;
  beforeEach(() => {
    cy.createAwxOrganization().then((o) => (organization = o));
  });
  afterEach(() => {
    cy.deleteAwxOrganization(organization);
  });

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
      cy.clickPageAction('delete-credential');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete credential/);
      cy.verifyPageTitle('Credentials');
      cy.deleteAwxCredentialType(credType);
    });
  });

  it('cannot edit vault id for Vault credential type', () => {
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.navigateTo('awx', 'credentials');
    cy.clickButton(/^Create credential$/);
    cy.getByDataCy('name').type(credentialName);
    cy.singleSelectBy('[data-cy="credential_type"]', 'Vault', true);
    cy.contains('Type Details').should('be.visible');
    cy.getByDataCy('vault-password').type('password');
    cy.getByDataCy('vault-id').type('id');
    cy.singleSelectByDataCy('organization', organization.name);
    cy.clickButton(/^Create credential$/);
    cy.verifyPageTitle(credentialName);
    cy.getByDataCy('name').contains(credentialName);
    cy.contains('Vault Identifier').should('be.visible');
    cy.getByDataCy('vault-identifier').contains('id');
    cy.contains('Vault Password').should('be.visible');
    cy.getByDataCy('vault-password').contains('Encrypted');
    cy.getByDataCy('edit-credential').click();
    cy.verifyPageTitle(`Edit ${credentialName}`);
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
    cy.clickPageAction('delete-credential');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential/);
    cy.verifyPageTitle('Credentials');
  });

  it('can create, edit and delete a credential that renders a sub form', () => {
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.navigateTo('awx', 'credentials');
    cy.clickButton(/^Create credential$/);
    cy.getByDataCy('name').type(credentialName);
    cy.singleSelectByDataCy('credential_type', 'Amazon Web Services');
    cy.contains('Type Details').should('be.visible');
    cy.singleSelectByDataCy('organization', organization.name);
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
        cy.getByDataCy('organization').contains(organization.name);
        cy.getByDataCy('label-description').contains('Description');
        cy.getByDataCy('description').contains('description');
        cy.getByDataCy('edit-credential').click();
        cy.verifyPageTitle(`Edit ${credentialName}`);
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

  it('create/edit a credential using prompt on launch', () => {
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.navigateTo('awx', 'credentials');
    cy.clickButton(/^Create credential$/);
    cy.getByDataCy('name').type(credentialName);
    cy.singleSelectByDataCy('organization', organization.name);
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
    cy.verifyPageTitle(`Edit ${credentialName}`);
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

  it('machine credential type should render privilege escalation', () => {
    // This is a test for the custom component that renders the privilege
    // escalation method using a custom component
    const credentialName = 'E2E Credential ' + randomString(4);
    cy.navigateTo('awx', 'credentials');
    cy.clickButton(/^Create credential$/);
    cy.getByDataCy('name').type(credentialName);
    cy.singleSelectByDataCy('organization', organization.name);
    cy.singleSelectBy('[data-cy="credential_type"]', 'Machine');
    cy.contains('Type Details').should('be.visible');
    // Use custom component to render the privilege escalation method is sudo
    cy.contains('Privilege Escalation Method ').should('be.visible');
    cy.get('button[aria-label="Typeahead creatable menu toggle"]').click();

    cy.get('button#select-create-typeahead-sudo').click();
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

cyLabel(['upstream'], () => {
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
          cy.createAWXCredential(
            {
              kind: 'machine',
              organization: awxOrganization.id,
            },
            'Machine'
          ).then((cred) => {
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
          });
      });
    }
    it('create a new credential, assign a team and apply role(s)', () => {
      cy.intercept('POST', awxAPI`/role_team_assignments/`).as('teamRoleAssignment');
      cy.navigateTo('awx', 'credentials');
      cy.filterTableBySearch(machineCredential.name);
      cy.clickTableRowLink('name', machineCredential.name, { disableFilter: true });
      cy.clickTab('Team Access', true);

      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.filterTableBySearch(awxTeam.name);
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

    it('create a new credential, assign a user and apply role(s)', () => {
      cy.intercept('POST', awxAPI`/role_user_assignments/`).as('userRoleAssignment');
      cy.navigateTo('awx', 'credentials');
      cy.filterTableBySearch(machineCredential.name);
      cy.clickTableRowLink('name', machineCredential.name, { disableFilter: true });
      cy.clickTab('User Access', true);

      cy.getByDataCy('assign-users').click();
      cy.verifyPageTitle('Assign users');
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
