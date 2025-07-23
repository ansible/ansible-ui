import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { HubRemote } from '@ansible/hub-ui/administration/remotes/Remotes';
import { AZURE_URL, SAAS_URL } from '../../support/constants';
import { pulpAPI } from '../../support/formatApiPathForHub';
import { Remotes } from './constants';

describe('Remotes', () => {
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateRemoteName(): string {
    return `e2e-test-${testSignature}-remote-${randomString(5, undefined, { isLowercase: true })}`;
  }

  it('bulk delete remotes', function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        this.skip();
      } else {
        const numberOfRemotes = 5;
        for (let i = 0; i < numberOfRemotes; i++) {
          const remoteName = generateRemoteName();
          cy.createRemote(remoteName);
        }
        cy.navigateTo('hub', 'remotes');
        cy.getBy('tbody').find('tr').its('length').should('be.greaterThan', 0);
        cy.setTablePageSize('50');
        cy.filterTableBySingleText(testSignature);
        cy.getBy('tbody').find('tr').should('have.length', numberOfRemotes);
        cy.get('input[name="check-all"]').click({ force: true });
        cy.clickToolbarKebabAction('delete-remotes');
        cy.getBy('#confirm').click();
        cy.clickButton(/^Delete remotes$/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Clear all filters$/);
      }
    });
  });

  it('explore different views and pagination', () => {
    const remoteName = generateRemoteName();
    cy.createRemote(remoteName).then((remote: HubRemote) => {
      cy.navigateTo('hub', 'remotes');
      cy.setTablePageSize('50');
      cy.filterTableBySingleText(remote.name);
      cy.getBy('[data-cy="card-view"]').click();
      cy.contains(remote.name).should('be.visible');
      cy.getBy('[data-cy="list-view"]').click();
      cy.contains(remote.name).should('be.visible');
      cy.getBy('[data-cy="table-view"]').click();
      cy.contains(remote.name).should('be.visible');
      cy.get('input[name="check-all"]').check();
      cy.clickToolbarKebabAction('delete-remotes');
      cy.getBy('#confirm').click();
      cy.clickButton(/^Delete remotes$/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('create, search and delete a remote', () => {
    cy.navigateTo('hub', 'remotes');
    const remoteName = generateRemoteName();
    cy.getBy('h1').should('contain', Remotes.title);
    cy.getBy('[data-cy="create-remote"]').should('be.visible').click();
    cy.url().should('include', Remotes.urlCreate);
    cy.getBy('[data-cy="name"]').type(remoteName);
    cy.getBy('[data-cy="url"]').type(Remotes.remoteURL);
    cy.getBy('[data-cy="Submit"]').click();
    cy.url().should('include', `remotes/${remoteName}/details`);
    cy.contains('Remotes').click();
    cy.url().should('include', Remotes.url);
    cy.filterTableBySingleText(remoteName);
    cy.clickTableRowAction('name', remoteName, 'delete-remote', {
      disableFilter: true,
      inKebab: true,
    });
    cy.getBy('#confirm').click();
    cy.clickButton(/^Delete remote/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('display alert when creating a remote with community URL and checking select `signed collections only`', function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        this.skip();
      } else {
        cy.navigateTo('hub', 'remotes');
        const remoteName = generateRemoteName();
        cy.getBy('[data-cy="create-remote"]').should('be.visible').click();
        cy.getBy('[data-cy="name"]').type(remoteName);
        cy.getBy('[data-cy="url"]').type(Remotes.remoteCommunityURL);
        cy.getBy('[data-cy="signed_only"]').check();
        cy.getBy('[data-cy="signed-only-warning"]').should('be.visible');
        cy.contains(Remotes.showAdvancedOptions).click();
        cy.getBy('[data-cy="url"]').clear().type(Remotes.remoteURL);
        cy.get('[data-cy="signed-only-warning"]').should('not.exist');
        cy.intercept({
          method: 'GET',
          url: pulpAPI`/remotes/ansible/collection/?name=${remoteName}`,
        }).as('remote');
        cy.getBy('[data-cy="Submit"]').click();
        cy.url().should('include', `remotes/${remoteName}/details`);
        cy.wait('@remote').then(() => {
          cy.contains('Remotes').click();
          cy.filterTableBySingleText(remoteName);
          cy.clickTableRowAction('name', remoteName, 'delete-remote', {
            disableFilter: true,
            inKebab: true,
          });
          cy.getBy('#confirm').click();
          cy.clickButton(/^Delete remote/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Clear all filters$/);
        });
      }
    });
  });

  it('edit a remote', function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        this.skip();
      } else {
        const communityCollection = `
---
collections:
  - name: ${Remotes.communityGeneral}
`;
        cy.navigateTo('hub', 'remotes');
        const remoteName = generateRemoteName();
        cy.getBy('[data-cy="create-remote"]').should('be.visible').click();
        cy.url().should('include', Remotes.urlCreate);
        cy.getBy('[data-cy="name"]').type(remoteName);
        cy.getBy('[data-cy="url"]').type(Remotes.remoteURL);
        cy.getBy('[data-cy="signed_only"]').check();
        cy.getBy('[data-cy="sync_dependencies"]').check();
        cy.getBy('[data-cy="Submit"]').click();
        cy.url().should('include', `remotes/${remoteName}/details`);
        cy.contains('Remotes').click();
        cy.filterTableBySingleText(remoteName);
        cy.getBy('[data-cy="actions-column-cell"]').click();
        cy.getBy('[data-cy="edit-remote"]').click({ force: true });
        cy.url().should('include', `remotes/${remoteName}/edit`);
        cy.getBy('[data-cy="url"]').clear().type(Remotes.editRemoteURL);
        cy.getBy('[data-cy="username"]').type(Remotes.username);
        cy.getBy('[data-cy="password"]').type(Remotes.password);
        cy.getBy('[data-cy="expandable-section"]').find('button').first().click();
        cy.getBy('[data-cy="token"]').type(Remotes.token);
        cy.getBy('[data-cy="auth-url"]').type(Remotes.ssoURL);
        cy.getBy('[data-cy="proxy-url"]').type(Remotes.proxyURL);
        cy.getBy('[data-cy="proxy-username"]').type(Remotes.username);
        cy.getBy('[data-cy="proxy-password"]').type(Remotes.password);
        cy.getBy('[data-cy="download-concurrency"]').type(Remotes.downloadConcurrency);
        cy.getBy('[data-cy="rate-limit"]').type(Remotes.rateLimit);
        cy.getBy('[data-cy="tls_validation"]').click();
        cy.getBy('[data-cy="requirements-file"]')
          .click()
          .focused()
          .invoke('select')
          .clear()
          .type(communityCollection);
        cy.clickButton(/^Save remote$/);
        cy.url().should('include', `remotes/${remoteName}/details`);
        cy.getBy('[data-cy="yaml-requirements"]');
        cy.getBy('[data-cy="code-block-value"]').should('contain', Remotes.communityGeneral);
        cy.url().should('include', `remotes/${remoteName}/details`);
        cy.getBy('[data-cy="name"]').should('contain', remoteName);
        cy.getBy('[data-cy="server-url"]').should('contain', Remotes.editRemoteURL);
        cy.getBy('[data-cy="proxy-url"]').should('contain', Remotes.proxyURL);
        cy.getBy('[data-cy="tls-validation"]').should('contain', Remotes.tlsValidation);
        cy.getBy('[data-cy="rate-limit"]').should('contain', Remotes.rateLimit);
        cy.getBy('[data-cy="download-concurrency"]').should('contain', Remotes.downloadConcurrency);
        cy.getBy('[data-cy="download-only-signed-collections"]').should(
          'contain',
          Remotes.signedOnly
        );
        cy.getBy('[data-cy="include-all-dependencies-when-syncing-a-collection"]').should(
          'contain',
          Remotes.syncDependencies
        );
        cy.getBy('[data-cy="actions-dropdown"]').click();
        cy.getBy('[data-cy="delete-remote"]').click();
        cy.getBy('#confirm').click();
        cy.clickButton(/^Delete remotes/);
      }
    });
  });

  it('create a remote with empty requirements file', function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        this.skip();
      } else {
        cy.navigateTo('hub', 'remotes');
        const remoteName = generateRemoteName();
        cy.getBy('[data-cy="create-remote"]').should('be.visible').click();
        cy.url().should('include', Remotes.urlCreate);
        cy.getBy('[data-cy="name"]').type(remoteName);
        cy.getBy('[data-cy="url"]').type(Remotes.remoteURL);
        cy.getBy('[data-cy="signed_only"]').check();
        cy.getBy('[data-cy="sync_dependencies"]').check();
        cy.getBy('[data-cy="requirements-file"]').click().focused().invoke('select').clear();
        cy.getBy('[data-cy="Submit"]').click();
        cy.url().should('include', `remotes/${remoteName}/details`);
        cy.get('[data-cy="label-yaml-requirements"]').should('contain', 'YAML requirements');
        cy.get('.pf-v6-c-code-block__content').should('not.exist');
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.getBy('[data-cy="delete-remote"]').click();
        cy.getBy('#confirm').click();
        cy.clickButton(/^Delete remotes$/);
      }
    });
  });

  it('edit a remote - save without changes', () => {
    /** Verification that touching a form field (typing something and then clearing it out) does not
     * cause the Save to fail with a "This field may not be blank." error.
     */
    const remoteName = generateRemoteName();
    cy.createRemote(remoteName).then((remote: HubRemote) => {
      cy.navigateTo('hub', 'remotes');
      cy.filterTableBySingleText(remote.name);
      cy.getByDataCy('edit-remote').click();
      cy.getBy('[data-cy="username"]').type('abc');
      cy.getBy('[data-cy="username"]').type('{backspace}{backspace}{backspace}');
      cy.clickButton(/^Save remote$/);
      cy.getBy('[data-cy="actions-dropdown"]').click();
      cy.getBy('[data-cy="delete-remote"]').click();
      cy.getBy('#confirm').click();
      cy.clickButton(/^Delete remotes/);
    });
  });

  it('has all download buttons working', () => {
    const ca_cert = `-----BEGIN CERTIFICATE-----
MIIFnzCCA4egAwIBAgIUWlomUBb9ad0KVgZDX05ynPyZfGYwDQYJKoZIhvcNAQEL
BQAweDELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5DMRAwDgYDVQQHDAdSYWxlaWdo
MQswCQYDVQQKDAJSSDEMMAoGA1UECwwDQUFQMQ4wDAYDVQQDDAVTYXJhaDEfMB0G
CSqGSIb3DQEJARYQc2FrdXNAcmVkaGF0LmNvbTAeFw0yNTA2MDIxOTEwMDFaFw0y
NjA2MDIxOTEwMDFaMHgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOQzEQMA4GA1UE
BwwHUmFsZWlnaDELMAkGA1UECgwCUkgxDDAKBgNVBAsMA0FBUDEOMAwGA1UEAwwF
U2FyYWgxHzAdBgkqhkiG9w0BCQEWEHNha3VzQHJlZGhhdC5jb20wggIiMA0GCSqG
SIb3DQEBAQUAA4ICDwAwggIKAoICAQCecCBMHukZydr0oL4PTQntM5klLpkI03eF
9AI9ws3zzRWhatFS0UYFs9CGA+O5yjK5neNJ8sHYmMxdhfFXOkJC1fWITgIerhhl
vHxXzVFu7IzJiOytfF01yYhUIFEIfjPpl4P0hld2UF/RfZeuLitsr5tpmv5S9YQg
t8uOr9fiMNnZltaKOmoYst1OZqF0LF5jKu8WyqyBBu/uh3UwW0kwQs7lPjYGUHy9
vFvcgrai9KPJlmQmxOGyPGmrcCJIKAjKMXOlEpYxSnWNb5aVCQFsxfwr1EKeD0Bk
ENIJU26MqMLmL6kMxtBIzSlX3xbkIV+nvAkonOJKoA1SWw5GAtbm8ai/ESsyJL6/
A4na9Ls7+Ckkfh+DuoGmwnw+XLHZcORCc6KojkKpgUlOlhYkJWAaFyxXzGZAHApA
WkX9k+7z1gPcmww6fRP9Ya23Usyq2qVnQnkhGkq6SJLO6CaifQ7geLFC6YjFeZwD
inNcHnGHHYpgYbNNuyHijUWcGlNkAEXMVvP61rF++spcDLp7zTgVxqSGh1XApphs
7SNyNddorBgPVTAmo52gpK92v/6YHECUDYNUV2Qlj8Pq3tt2LN1SZfXNiB53y3CB
NBh4n4z73JXrAyRbBsbBSGxoanW1l1tnT0ZGXK6yb2vNOjIeLuSZOEmEbHBdRWvH
icYr9hbWUQIDAQABoyEwHzAdBgNVHQ4EFgQUEw2Trbq6Kq/jw3CiFr3VDpzjAZQw
DQYJKoZIhvcNAQELBQADggIBAHEPppPMDSbNWQyrf8jmM2LhFgW/P0IQ0NYdkiLy
eoxYWCcDD8ijzIXKRjxjD4dD1z2dOvYxBLKp3P7NieNY26mS7qtre0D7aZQf0Mme
KLfwfl3hw7Mj7VybkVEMb2bydsBFK/HdAgFZqcbdWp6GP+1PvIydRUxXT+LiXuAo
MuWT13kDZGDqBb7YTWMM1GUSMxWhUQ4oWzW4T+fVl+2zWchx4VihKJFlmMBL6BCV
R17TS5aRHW+PAHcyNg71hauiySHhZaRmO/D93HQ3ack2aXU/wV+kk/8HOkykRWIB
bSwzmuSBHyc5wzBUrp3DBNO/7cx7CY6+ag2GnLKIXOxf1YymRVMG4o1b2fyLZ+1+
QVjjkaIYvaKChcmBWyVUzSIVd+BFnlG4uQNGoLzxS8uCDXBYazFzLSqUP2dqmRDw
uASL/4W4JlKHTvusoR9H8lEgHUb1wRQW+ISwM6rql5bzhgiJQRuQm4rYqFvDh0Tn
pKz7Fnz1TatALJPnHnM8UacjdGaykV1X3HiWLRcMHskkmNlYgI4EoLiRnh5K2WX+
cI3I9fHNSyiL1iGw4EicfTwhJIiEPbR0K/NFm/M4fCit4pWVWh/QBIusUQ8XtXGT
ZctsPsQiuHJzMv/25snuVzBaBTmEN5OxAQc1JS7uYakyvJ6T108Vb4K+7dnQ6GZm
oVRa
-----END CERTIFICATE-----`;
    const client_cert = `-----BEGIN CERTIFICATE-----
MIIFnzCCA4egAwIBAgIUWlomUBb9ad0KVgZDX05ynPyZfGYwDQYJKoZIhvcNAQEL
BQAweDELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5DMRAwDgYDVQQHDAdSYWxlaWdo
MQswCQYDVQQKDAJSSDEMMAoGA1UECwwDQUFQMQ4wDAYDVQQDDAVTYXJhaDEfMB0G
CSqGSIb3DQEJARYQc2FrdXNAcmVkaGF0LmNvbTAeFw0yNTA2MDIxOTEwMDFaFw0y
NjA2MDIxOTEwMDFaMHgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOQzEQMA4GA1UE
BwwHUmFsZWlnaDELMAkGA1UECgwCUkgxDDAKBgNVBAsMA0FBUDEOMAwGA1UEAwwF
U2FyYWgxHzAdBgkqhkiG9w0BCQEWEHNha3VzQHJlZGhhdC5jb20wggIiMA0GCSqG
SIb3DQEBAQUAA4ICDwAwggIKAoICAQCecCBMHukZydr0oL4PTQntM5klLpkI03eF
9AI9ws3zzRWhatFS0UYFs9CGA+O5yjK5neNJ8sHYmMxdhfFXOkJC1fWITgIerhhl
vHxXzVFu7IzJiOytfF01yYhUIFEIfjPpl4P0hld2UF/RfZeuLitsr5tpmv5S9YQg
t8uOr9fiMNnZltaKOmoYst1OZqF0LF5jKu8WyqyBBu/uh3UwW0kwQs7lPjYGUHy9
vFvcgrai9KPJlmQmxOGyPGmrcCJIKAjKMXOlEpYxSnWNb5aVCQFsxfwr1EKeD0Bk
ENIJU26MqMLmL6kMxtBIzSlX3xbkIV+nvAkonOJKoA1SWw5GAtbm8ai/ESsyJL6/
A4na9Ls7+Ckkfh+DuoGmwnw+XLHZcORCc6KojkKpgUlOlhYkJWAaFyxXzGZAHApA
WkX9k+7z1gPcmww6fRP9Ya23Usyq2qVnQnkhGkq6SJLO6CaifQ7geLFC6YjFeZwD
inNcHnGHHYpgYbNNuyHijUWcGlNkAEXMVvP61rF++spcDLp7zTgVxqSGh1XApphs
7SNyNddorBgPVTAmo52gpK92v/6YHECUDYNUV2Qlj8Pq3tt2LN1SZfXNiB53y3CB
NBh4n4z73JXrAyRbBsbBSGxoanW1l1tnT0ZGXK6yb2vNOjIeLuSZOEmEbHBdRWvH
icYr9hbWUQIDAQABoyEwHzAdBgNVHQ4EFgQUEw2Trbq6Kq/jw3CiFr3VDpzjAZQw
DQYJKoZIhvcNAQELBQADggIBAHEPppPMDSbNWQyrf8jmM2LhFgW/P0IQ0NYdkiLy
eoxYWCcDD8ijzIXKRjxjD4dD1z2dOvYxBLKp3P7NieNY26mS7qtre0D7aZQf0Mme
KLfwfl3hw7Mj7VybkVEMb2bydsBFK/HdAgFZqcbdWp6GP+1PvIydRUxXT+LiXuAo
MuWT13kDZGDqBb7YTWMM1GUSMxWhUQ4oWzW4T+fVl+2zWchx4VihKJFlmMBL6BCV
R17TS5aRHW+PAHcyNg71hauiySHhZaRmO/D93HQ3ack2aXU/wV+kk/8HOkykRWIB
bSwzmuSBHyc5wzBUrp3DBNO/7cx7CY6+ag2GnLKIXOxf1YymRVMG4o1b2fyLZ+1+
QVjjkaIYvaKChcmBWyVUzSIVd+BFnlG4uQNGoLzxS8uCDXBYazFzLSqUP2dqmRDw
uASL/4W4JlKHTvusoR9H8lEgHUb1wRQW+ISwM6rql5bzhgiJQRuQm4rYqFvDh0Tn
pKz7Fnz1TatALJPnHnM8UacjdGaykV1X3HiWLRcMHskkmNlYgI4EoLiRnh5K2WX+
cI3I9fHNSyiL1iGw4EicfTwhJIiEPbR0K/NFm/M4fCit4pWVWh/QBIusUQ8XtXGT
ZctsPsQiuHJzMv/25snuVzBaBTmEN5OxAQc1JS7uYakyvJ6T108Vb4K+7dnQ6GZm
oVRa
-----END CERTIFICATE-----`;
    const requirements_file = 'collections:\n  - testing.ansible_testing_content';
    const remoteName = generateRemoteName();
    cy.createRemote(
      remoteName,
      'https://console.redhat.com/api/automation-hub/',
      ca_cert,
      client_cert,
      requirements_file
    );
    cy.navigateTo('hub', 'remotes');
    cy.filterTableBySingleText(remoteName);
    cy.clickTableRowAction('name', remoteName, 'download-requirement-file', {
      inKebab: true,
      disableFilter: true,
    });
    cy.clickTableRowAction('name', remoteName, 'download-ca-certificate', {
      inKebab: true,
      disableFilter: true,
    });
    cy.clickTableRowAction('name', remoteName, 'download-client-certificate', {
      inKebab: true,
      disableFilter: true,
    });
    cy.readFile('cypress/downloads/requirement.yaml').should('eq', requirements_file);
    cy.readFile('cypress/downloads/client_cert.txt').should(
      'contains',
      `-----BEGIN CERTIFICATE-----\nMIIFnzCCA4egAwIBAgIUWlomUBb9ad0KVgZDX05ynPyZfGYwDQYJKoZIhvcNAQEL\nBQAweDELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5DMRAwDgYDVQQHDAdSYWxlaWdo\nMQswCQYDVQQKDAJSSDEMMAoGA1UECwwDQUFQMQ4wDAYDVQQDDAVTYXJhaDEfMB0G\nCSqGSIb3DQEJARYQc2FrdXNAcmVkaGF0LmNvbTAeFw0yNTA2MDIxOTEwMDFaFw0y\nNjA2MDIxOTEwMDFaMHgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOQzEQMA4GA1UE\nBwwHUmFsZWlnaDELMAkGA1UECgwCUkgxDDAKBgNVBAsMA0FBUDEOMAwGA1UEAwwF\nU2FyYWgxHzAdBgkqhkiG9w0BCQEWEHNha3VzQHJlZGhhdC5jb20wggIiMA0GCSqG\nSIb3DQEBAQUAA4ICDwAwggIKAoICAQCecCBMHukZydr0oL4PTQntM5klLpkI03eF\n9AI9ws3zzRWhatFS0UYFs9CGA+O5yjK5neNJ8sHYmMxdhfFXOkJC1fWITgIerhhl\nvHxXzVFu7IzJiOytfF01yYhUIFEIfjPpl4P0hld2UF/RfZeuLitsr5tpmv5S9YQg\nt8uOr9fiMNnZltaKOmoYst1OZqF0LF5jKu8WyqyBBu/uh3UwW0kwQs7lPjYGUHy9\nvFvcgrai9KPJlmQmxOGyPGmrcCJIKAjKMXOlEpYxSnWNb5aVCQFsxfwr1EKeD0Bk\nENIJU26MqMLmL6kMxtBIzSlX3xbkIV+nvAkonOJKoA1SWw5GAtbm8ai/ESsyJL6/\nA4na9Ls7+Ckkfh+DuoGmwnw+XLHZcORCc6KojkKpgUlOlhYkJWAaFyxXzGZAHApA\nWkX9k+7z1gPcmww6fRP9Ya23Usyq2qVnQnkhGkq6SJLO6CaifQ7geLFC6YjFeZwD\ninNcHnGHHYpgYbNNuyHijUWcGlNkAEXMVvP61rF++spcDLp7zTgVxqSGh1XApphs\n7SNyNddorBgPVTAmo52gpK92v/6YHECUDYNUV2Qlj8Pq3tt2LN1SZfXNiB53y3CB\nNBh4n4z73JXrAyRbBsbBSGxoanW1l1tnT0ZGXK6yb2vNOjIeLuSZOEmEbHBdRWvH\nicYr9hbWUQIDAQABoyEwHzAdBgNVHQ4EFgQUEw2Trbq6Kq/jw3CiFr3VDpzjAZQw\nDQYJKoZIhvcNAQELBQADggIBAHEPppPMDSbNWQyrf8jmM2LhFgW/P0IQ0NYdkiLy\neoxYWCcDD8ijzIXKRjxjD4dD1z2dOvYxBLKp3P7NieNY26mS7qtre0D7aZQf0Mme\nKLfwfl3hw7Mj7VybkVEMb2bydsBFK/HdAgFZqcbdWp6GP+1PvIydRUxXT+LiXuAo\nMuWT13kDZGDqBb7YTWMM1GUSMxWhUQ4oWzW4T+fVl+2zWchx4VihKJFlmMBL6BCV\nR17TS5aRHW+PAHcyNg71hauiySHhZaRmO/D93HQ3ack2aXU/wV+kk/8HOkykRWIB\nbSwzmuSBHyc5wzBUrp3DBNO/7cx7CY6+ag2GnLKIXOxf1YymRVMG4o1b2fyLZ+1+\nQVjjkaIYvaKChcmBWyVUzSIVd+BFnlG4uQNGoLzxS8uCDXBYazFzLSqUP2dqmRDw\nuASL/4W4JlKHTvusoR9H8lEgHUb1wRQW+ISwM6rql5bzhgiJQRuQm4rYqFvDh0Tn\npKz7Fnz1TatALJPnHnM8UacjdGaykV1X3HiWLRcMHskkmNlYgI4EoLiRnh5K2WX+\ncI3I9fHNSyiL1iGw4EicfTwhJIiEPbR0K/NFm/M4fCit4pWVWh/QBIusUQ8XtXGT\nZctsPsQiuHJzMv/25snuVzBaBTmEN5OxAQc1JS7uYakyvJ6T108Vb4K+7dnQ6GZm\noVRa\n-----END CERTIFICATE-----`
    );
    cy.readFile('cypress/downloads/ca_cert.txt').should(
      'contains',
      `-----BEGIN CERTIFICATE-----\nMIIFnzCCA4egAwIBAgIUWlomUBb9ad0KVgZDX05ynPyZfGYwDQYJKoZIhvcNAQEL\nBQAweDELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5DMRAwDgYDVQQHDAdSYWxlaWdo\nMQswCQYDVQQKDAJSSDEMMAoGA1UECwwDQUFQMQ4wDAYDVQQDDAVTYXJhaDEfMB0G\nCSqGSIb3DQEJARYQc2FrdXNAcmVkaGF0LmNvbTAeFw0yNTA2MDIxOTEwMDFaFw0y\nNjA2MDIxOTEwMDFaMHgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOQzEQMA4GA1UE\nBwwHUmFsZWlnaDELMAkGA1UECgwCUkgxDDAKBgNVBAsMA0FBUDEOMAwGA1UEAwwF\nU2FyYWgxHzAdBgkqhkiG9w0BCQEWEHNha3VzQHJlZGhhdC5jb20wggIiMA0GCSqG\nSIb3DQEBAQUAA4ICDwAwggIKAoICAQCecCBMHukZydr0oL4PTQntM5klLpkI03eF\n9AI9ws3zzRWhatFS0UYFs9CGA+O5yjK5neNJ8sHYmMxdhfFXOkJC1fWITgIerhhl\nvHxXzVFu7IzJiOytfF01yYhUIFEIfjPpl4P0hld2UF/RfZeuLitsr5tpmv5S9YQg\nt8uOr9fiMNnZltaKOmoYst1OZqF0LF5jKu8WyqyBBu/uh3UwW0kwQs7lPjYGUHy9\nvFvcgrai9KPJlmQmxOGyPGmrcCJIKAjKMXOlEpYxSnWNb5aVCQFsxfwr1EKeD0Bk\nENIJU26MqMLmL6kMxtBIzSlX3xbkIV+nvAkonOJKoA1SWw5GAtbm8ai/ESsyJL6/\nA4na9Ls7+Ckkfh+DuoGmwnw+XLHZcORCc6KojkKpgUlOlhYkJWAaFyxXzGZAHApA\nWkX9k+7z1gPcmww6fRP9Ya23Usyq2qVnQnkhGkq6SJLO6CaifQ7geLFC6YjFeZwD\ninNcHnGHHYpgYbNNuyHijUWcGlNkAEXMVvP61rF++spcDLp7zTgVxqSGh1XApphs\n7SNyNddorBgPVTAmo52gpK92v/6YHECUDYNUV2Qlj8Pq3tt2LN1SZfXNiB53y3CB\nNBh4n4z73JXrAyRbBsbBSGxoanW1l1tnT0ZGXK6yb2vNOjIeLuSZOEmEbHBdRWvH\nicYr9hbWUQIDAQABoyEwHzAdBgNVHQ4EFgQUEw2Trbq6Kq/jw3CiFr3VDpzjAZQw\nDQYJKoZIhvcNAQELBQADggIBAHEPppPMDSbNWQyrf8jmM2LhFgW/P0IQ0NYdkiLy\neoxYWCcDD8ijzIXKRjxjD4dD1z2dOvYxBLKp3P7NieNY26mS7qtre0D7aZQf0Mme\nKLfwfl3hw7Mj7VybkVEMb2bydsBFK/HdAgFZqcbdWp6GP+1PvIydRUxXT+LiXuAo\nMuWT13kDZGDqBb7YTWMM1GUSMxWhUQ4oWzW4T+fVl+2zWchx4VihKJFlmMBL6BCV\nR17TS5aRHW+PAHcyNg71hauiySHhZaRmO/D93HQ3ack2aXU/wV+kk/8HOkykRWIB\nbSwzmuSBHyc5wzBUrp3DBNO/7cx7CY6+ag2GnLKIXOxf1YymRVMG4o1b2fyLZ+1+\nQVjjkaIYvaKChcmBWyVUzSIVd+BFnlG4uQNGoLzxS8uCDXBYazFzLSqUP2dqmRDw\nuASL/4W4JlKHTvusoR9H8lEgHUb1wRQW+ISwM6rql5bzhgiJQRuQm4rYqFvDh0Tn\npKz7Fnz1TatALJPnHnM8UacjdGaykV1X3HiWLRcMHskkmNlYgI4EoLiRnh5K2WX+\ncI3I9fHNSyiL1iGw4EicfTwhJIiEPbR0K/NFm/M4fCit4pWVWh/QBIusUQ8XtXGT\nZctsPsQiuHJzMv/25snuVzBaBTmEN5OxAQc1JS7uYakyvJ6T108Vb4K+7dnQ6GZm\noVRa\n-----END CERTIFICATE-----`
    );
  });
});
