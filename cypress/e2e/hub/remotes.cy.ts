import { randomString } from '../../../framework/utils/random-string';
import { HubRemote } from '../../../frontend/hub/administration/remotes/Remotes';
import { pulpAPI } from '../../support/formatApiPathForHub';
import { Remotes } from './constants';

describe('Remotes', () => {
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateRemoteName(): string {
    return `e2e-test-${testSignature}-remote-${randomString(5, undefined, { isLowercase: true })}`;
  }

  it('bulk delete remotes', () => {
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
    cy.getBy('[data-cy="select-all"]').click({ force: true });
    cy.clickToolbarKebabAction('delete-remotes');
    cy.getBy('#confirm').click();
    cy.clickButton(/^Delete remotes$/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
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
      cy.getBy('#select-all').click();
      cy.clickToolbarKebabAction('delete-remotes');
      cy.getBy('#confirm').click();
      cy.clickButton(/^Delete remotes$/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
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
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('display alert when creating a remote with community URL and checking select `signed collections only`', () => {
    cy.navigateTo('hub', 'remotes');
    const remoteName = generateRemoteName();
    cy.getBy('[data-cy="create-remote"]').should('be.visible').click();
    cy.getBy('[data-cy="name"]').type(remoteName);
    cy.getBy('[data-cy="url"]').type(Remotes.remoteCommunityURL);
    cy.getBy('[data-cy="signed_only"]').check();
    cy.getBy('[data-cy="signed-only-warning"]').should('be.visible');
    cy.contains(Remotes.showAdvancedOptions).click();
    // cy.getBy('[data-cy="requirements-file-warning"]').should('be.visible');
    cy.getBy('[data-cy="url"]').clear().type(Remotes.remoteURL);
    cy.getBy('[data-cy="signed-only-warning"]').should('not.exist');
    // cy.getBy('[data-cy="requirements-file-warning"]').should('not.exist');
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
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('edit a remote', () => {
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
    cy.clickButton(/^Clear all filters$/);
    cy.contains(remoteName).click();
    cy.getBy('[data-cy="yaml-requirements"]');
    cy.getBy('[data-cy="code-block-value"]').should('contain', Remotes.communityGeneral);
    cy.url().should('include', `remotes/${remoteName}/details`);
    cy.getBy('[data-cy="name"]').should('contain', remoteName);
    cy.getBy('[data-cy="url"]').should('contain', Remotes.editRemoteURL);
    cy.getBy('[data-cy="proxy-url"]').should('contain', Remotes.proxyURL);
    cy.getBy('[data-cy="tls-validation"]').should('contain', Remotes.tlsValidation);
    cy.getBy('[data-cy="rate-limit"]').should('contain', Remotes.rateLimit);
    cy.getBy('[data-cy="download-concurrency"]').should('contain', Remotes.downloadConcurrency);
    cy.getBy('[data-cy="download-only-signed-collections"]').should('contain', Remotes.signedOnly);
    cy.getBy('[data-cy="include-all-dependencies-when-syncing-a-collection"]').should(
      'contain',
      Remotes.syncDependencies
    );

    // Delete the edited remote
    cy.getBy('[data-cy="actions-dropdown"]').click();
    cy.getBy('[data-cy="delete-remote"]').click();
    cy.getBy('#confirm').click();
    cy.clickButton(/^Delete remotes/);
  });

  it('has all download buttons working', () => {
    const ca_cert = 'ca_cert';
    const client_cert = 'client_cert';
    const requirements_file =
      'collections:\n' +
      '  - name: my_namespace.my_collection_name\n' +
      '  - name: my_namespace.my_collection_name2';
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
    cy.readFile('cypress/downloads/client_cert.txt').should('eq', client_cert);
    cy.readFile('cypress/downloads/ca_cert.txt').should('eq', ca_cert);
  });
});
