/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { SetRequired } from 'type-fest';
import { randomLowercaseString, randomString } from '../../framework/utils/random-string';
import { Role } from '../../frontend/hub/access/roles/Role';
import { RemoteRegistry } from '../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { HubRemote } from '../../frontend/hub/administration/remotes/Remotes';
import { Repository } from '../../frontend/hub/administration/repositories/Repository';
import { Task } from '../../frontend/hub/administration/tasks/Task';
import { CollectionVersionSearch } from '../../frontend/hub/collections/Collection';
import { parsePulpIDFromURL } from '../../frontend/hub/common/api/hub-api-utils';
import { HubItemsResponse, PulpItemsResponse } from '../../frontend/hub/common/useHubView';
import { ExecutionEnvironment as HubExecutionEnvironment } from '../../frontend/hub/execution-environments/ExecutionEnvironment';
import { PayloadDataType as HubExecutionEnvironmentPayload } from '../../frontend/hub/execution-environments/ExecutionEnvironmentForm';
import { HubDistribution } from '../../frontend/hub/interfaces/expanded/HubDistribution';
import { HubNamespace } from '../../frontend/hub/namespaces/HubNamespace';
import { ExecutionEnvironments } from '../e2e/hub/constants';
import { galaxykitPassword, galaxykitUsername } from './e2e';
import { hubAPI, pulpAPI } from './formatApiPathForHub';
import { escapeForShellCommand, randomE2Ename } from './utils';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

export interface HubRequestOptions {
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  url: string;
  body?: object;
  qs?: object;
  failOnStatusCode?: boolean;
}
Cypress.Commands.add('hubRequest', (options: HubRequestOptions) => {
  cy.getCookie('csrftoken', { log: false }).then((cookie) =>
    cy
      .request({
        ...options,
        headers: { 'X-CSRFToken': cookie?.value, Referer: Cypress.config().baseUrl },
      })
      .then((response) => {
        switch (response.status) {
          case 202: // Accepted
            return cy.waitOnHubTask((response.body as { task: string }).task);
        }
      })
  );
});

export type HubGetRequestOptions = Pick<HubRequestOptions, 'url' | 'qs' | 'failOnStatusCode'>;
Cypress.Commands.add('hubGetRequest', (options: HubGetRequestOptions) => {
  cy.hubRequest({ ...options, method: 'GET' });
});

export type HubPutRequestOptions = Pick<
  HubRequestOptions,
  'url' | 'body' | 'qs' | 'failOnStatusCode'
>;
export type HubPostRequestOptions = Pick<
  HubRequestOptions,
  'url' | 'body' | 'qs' | 'failOnStatusCode'
>;
Cypress.Commands.add('hubPostRequest', (options: HubPostRequestOptions) => {
  cy.hubRequest({ ...options, method: 'POST' }).then((response) => {
    if (response.status === 201) {
      return response.body;
    }
  });
});

export type HubPatchRequestOptions = Pick<
  HubRequestOptions,
  'url' | 'body' | 'qs' | 'failOnStatusCode'
>;
export type HubDeleteRequestOptions = Pick<HubRequestOptions, 'url' | 'qs' | 'failOnStatusCode'>;
Cypress.Commands.add('hubDeleteRequest', (options: HubDeleteRequestOptions) => {
  cy.hubRequest({ ...options, method: 'DELETE' });
});

Cypress.Commands.add('waitOnHubTask', function waitOnHubTask(taskUrl: string) {
  cy.requestPoll<Task>({
    url: taskUrl,
    check: (response) => {
      switch (response.status) {
        case 200:
          switch (response.body.state) {
            case 'completed':
              return response.body;
            case 'failed':
            case 'canceled':
            case 'skipped':
              if (response.body.error?.description) {
                throw new Error(response.body.error.description);
              } else {
                throw new Error('Task failed without error message.');
              }
            default:
              return undefined;
          }
        case 404:
          throw new Error('Task not found');
        default:
          return undefined;
      }
    },
  });
});

// GalaxyKit Integration: To invoke `galaxykit` commands for generating resource
Cypress.Commands.add('galaxykit', (operation: string, ...args: string[]) => {
  const galaxykitCommand = (Cypress.env('HUB_GALAXYKIT_COMMAND') as string) ?? 'galaxykit';
  const server = (Cypress.env('HUB_SERVER') as string) + apiPrefix + '/';
  const options = { failOnNonZeroExit: false };

  operation = operation.trim();
  args = args.map((arg) => arg.trim());

  cy.log(`${galaxykitCommand} ${operation} ${args.join(' ')}`);

  const cmd = `${galaxykitCommand} -c -s '${server}' -u '${galaxykitUsername}' -p '${galaxykitPassword}' ${operation} ${escapeForShellCommand(
    args
  )}`;

  cy.exec(cmd, options).then(({ code, stderr, stdout }) => {
    cy.log(`RUN ${cmd}`, code, stderr, stdout).then(() => {
      if (code) {
        cy.log('galaxykit code: ' + code.toString()).then(() => {
          cy.log('galaxykit stderr: ' + stderr).then(() => {
            throw new Error(`Galaxykit failed: ${stderr}`);
          });
        });
      }
    });

    cy.log(`stdout: ${stdout}`);

    let parsedStdout: unknown;
    try {
      parsedStdout = JSON.parse(stdout);
    } catch (e) {
      parsedStdout = stdout.split('\n').filter((s) => !!s);
    }
    return cy.wrap(parsedStdout);
  });
});

Cypress.Commands.add(
  'createApprovedCollection',
  (namespaceName: string, collectionName: string, tags?: string[]) => {
    const waitTillPublished = (maxLoops: number) => {
      if (maxLoops === 0) {
        cy.log('Max loops reached while waiting for the approved collection.');
        return;
      }

      cy.wait(300);

      cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
        hubAPI`/v3/plugin/ansible/search/collection-versions/?namespace=${namespaceName}&name=${collectionName}`
      ).then((itemsResponse) => {
        if (itemsResponse.data.length === 0) {
          waitTillPublished(maxLoops - 1);
        } else if (itemsResponse.data[0]?.repository?.name !== 'published') {
          waitTillPublished(maxLoops - 1);
        } else {
          cy.log('Collection published');
        }
      });
    };
    // test runs 1
    if (tags?.length) {
      cy.galaxykit(
        '-i collection upload',
        namespaceName,
        collectionName,
        `--tags ${tags.join(' ')}`
      );
    } else {
      cy.galaxykit('-i collection upload', namespaceName, collectionName);
    }

    waitTillPublished(10);

    // TODO for Insights mode
    // if (insightsLogin) {
    //   cy.galaxykit('-i collection move', namespace, collection);
    // }
  }
);

Cypress.Commands.add('uploadHubCollectionFile', (hubFilePath: string) => {
  cy.get('[data-cy="upload-collection"]').click();
  cy.get('#file-browse-button').click();
  cy.get('input[id="file-filename"]').selectFile(hubFilePath, {
    action: 'drag-drop',
  });
});

Cypress.Commands.add('createNamespace', (namespaceName: string) => {
  cy.galaxykit('namespace create', namespaceName);
});

Cypress.Commands.add('deleteNamespace', (namespaceName: string) => {
  cy.galaxykit('-i namespace delete', namespaceName);
});

Cypress.Commands.add('deleteCollectionsInNamespace', (namespaceName: string) => {
  cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?namespace=${namespaceName}`
  ).then((itemsResponse) => {
    cy.log(`count of collections in namespace: ${itemsResponse.data.length}`);
    for (const collection of itemsResponse.data) {
      cy.galaxykit(
        'collection delete',
        collection.collection_version?.namespace || '',
        collection.collection_version?.name || '',
        collection.collection_version?.version || '',
        collection.repository?.name || ''
      );
    }
  });
});

Cypress.Commands.add('createRemote', (remoteName: string, url?: string) => {
  cy.requestPost(pulpAPI`/remotes/ansible/collection/`, {
    name: remoteName,
    url: url ? url : 'https://console.redhat.com/api/automation-hub/',
  });
});

Cypress.Commands.add('createRemoteRegistry', (remoteRegistryName: string, url?: string) => {
  cy.requestPost(hubAPI`/_ui/v1/execution-environments/registries/`, {
    name: remoteRegistryName,
    url: url ? url : 'https://console.redhat.com/api/automation-hub/',
  });
});

Cypress.Commands.add('deleteRemoteRegistry', (remoteRegistryId: string) => {
  cy.requestDelete(hubAPI`/_ui/v1/execution-environments/registries/${remoteRegistryId}/`);
});

// Skipping until deeper debug
// Cypress.Commands.add('deleteCollection', (collection: string, namespace: string, repository: string) => {
//   cy.galaxykit(`collection delete ${namespace} ${collection}`);
// });

Cypress.Commands.add(
  'deleteCollection',
  (
    collectionName: string,
    namespaceName: string,
    repository: string,
    version?: string,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    const fail = options?.failOnStatusCode ? '' : '-i';
    const versionToDelete = version ? version : '1.0.0';
    cy.galaxykit(
      fail + ' collection delete',
      namespaceName,
      collectionName,
      versionToDelete,
      repository
    );
  }
);

Cypress.Commands.add(
  'uploadCollection',
  (collection: string, namespace: string, version?: string) => {
    cy.galaxykit(`collection upload ${namespace} ${collection} ${version ? version : '1.0.0'}`);
  }
);

Cypress.Commands.add(
  'approveCollection',
  (collection: string, namespace: string, version: string) => {
    cy.galaxykit(`collection move ${namespace} ${collection} ${version} staging published`);
  }
);

Cypress.Commands.add('collectionCopyVersionToRepositories', (collection: string) => {
  cy.navigateTo('hub', 'collections');
  cy.filterTableByText(collection);

  cy.get('[data-cy="data-list-name"]').should('have.text', collection);
  cy.get('[data-cy="data-list-action"]').within(() => {
    cy.get('[data-cy="actions-dropdown"]')
      .first()
      .click()
      .then(() => {
        cy.get('[data-cy="copy-version-to-repositories"]').click();
      });
  });

  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.clickButton(/^Clear all filters$/);
    cy.get('header').contains('Select repositories');
    cy.get('button').contains('Select').should('have.attr', 'aria-disabled', 'true');
    cy.filterTableByText('community');
    cy.get('[data-cy="data-list-check"]').click();
    cy.get('button').contains('Select').click();
  });

  cy.navigateTo('hub', 'approvals');
  cy.clickButton(/^Clear all filters$/);
  cy.filterBySingleSelection(/^Repository$/, 'community');
  cy.get('[data-cy="repository-column-cell"]').should('contain', 'community');
});

// HUB Execution Environment Commands
export type HubQueryExecutionEnvironmentsOptions = { qs?: { limit?: number } } & Omit<
  HubGetRequestOptions,
  'url'
>;
export type HubCreateExecutionEnvironmentOptions = {
  executionEnvironment: SetRequired<Partial<HubExecutionEnvironmentPayload>, 'registry'>;
} & Omit<HubPostRequestOptions, 'url' | 'body'>;

Cypress.Commands.add(
  'createHubExecutionEnvironment',
  (options: HubCreateExecutionEnvironmentOptions) => {
    cy.hubPostRequest({
      ...options,
      url: hubAPI`/_ui/v1/execution-environments/remotes/`,
      body: {
        name: randomE2Ename(),
        upstream_name: 'library/alpine',
        ...options?.executionEnvironment,
      },
    });
  }
);

export type HubDeleteExecutionEnvironmentOptions = { name: string } & Omit<
  HubDeleteRequestOptions,
  'url'
>;

Cypress.Commands.add(
  'deleteHubExecutionEnvironment',
  (options: HubDeleteExecutionEnvironmentOptions) => {
    cy.hubDeleteRequest({
      ...options,
      url: hubAPI`/v3/plugin/execution-environments/repositories/${options.name}/`,
    });
  }
);

Cypress.Commands.add(
  'syncRemoteExecutionEnvironment',
  (executionEnvironment: HubExecutionEnvironment) => {
    cy.visit(`${ExecutionEnvironments.url}/${executionEnvironment.name}/`);
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('sync-execution-environment').click();

    cy.clickModalConfirmCheckbox();
    cy.intercept(
      'POST',
      hubAPI`/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/sync/`
    ).as('eeSync');
    cy.clickButton('Sync execution environments');
    cy.wait('@eeSync').then((xhr) => {
      const task = xhr?.response?.body?.task as string;
      cy.waitOnHubTask(task).then((currentSubject: unknown) => {
        const task = currentSubject as Task;
        expect(task.state).to.be.eql('completed');
        cy.contains('Success');
        cy.clickButton('Close');
      });
    });
  }
);

// HUB Remote Registry Commands
export type HubCreateRemoteRegistryOptions = {
  remoteRegistry: Partial<RemoteRegistry>;
} & Omit<HubPostRequestOptions, 'url' | 'body'>;

Cypress.Commands.add('createHubRemoteRegistry', (options?: HubCreateRemoteRegistryOptions) => {
  cy.hubPostRequest({
    ...options,
    url: hubAPI`/_ui/v1/execution-environments/registries/`,
    body: {
      name: randomE2Ename(),
      url: 'https://registry.hub.docker.com/',
      ...options?.remoteRegistry,
    },
  });
});

export type HubDeleteRemoteRegistryOptions = { id: string } & Omit<HubDeleteRequestOptions, 'url'>;

Cypress.Commands.add('deleteHubRemoteRegistry', (options: HubDeleteRemoteRegistryOptions) => {
  cy.hubDeleteRequest({
    ...options,
    url: hubAPI`/_ui/v1/execution-environments/registries/${options.id}/`,
  });
});

// HUB Repository Commands
export type HubQueryRepositoriesOptions = { qs?: { limit?: number } } & Omit<
  HubGetRequestOptions,
  'url'
>;
Cypress.Commands.add('queryHubRepositories', (options?: HubQueryRepositoriesOptions) => {
  cy.hubGetRequest({
    ...options,
    url: pulpAPI`/repositories/ansible/ansible/`,
  });
});
export type HubCreateRepositoryOptions = {
  repository: Partial<Repository>;
} & Omit<HubPostRequestOptions, 'url' | 'body'>;

Cypress.Commands.add('createHubRepository', (options?: HubCreateRepositoryOptions) => {
  cy.hubPostRequest({
    ...options,
    url: pulpAPI`/repositories/ansible/ansible/`,
    body: {
      description: null,
      name: randomE2Ename(),
      private: false,
      pulp_labels: {},
      remote: null,
      retain_repo_versions: 1,
      ...options?.repository,
    },
  });
});

export type HubDeleteRepositoryOptions = { pulp_href: string } & Omit<
  HubDeleteRequestOptions,
  'url'
>;

Cypress.Commands.add('deleteHubRepository', (options: HubDeleteRepositoryOptions) => {
  const pulpUUID = parsePulpIDFromURL(options.pulp_href);
  cy.hubDeleteRequest({
    ...options,
    url: pulpAPI`/repositories/ansible/ansible/${pulpUUID ?? ''}/`,
  });
});

// HUB Repository Distribution Commands
export type HubCreateRepositoryDistributionOptions = {
  distribution: Partial<HubDistribution>;
} & Omit<HubPostRequestOptions, 'url' | 'body'>;
Cypress.Commands.add(
  'createHubRepositoryDistribution',
  (options?: HubCreateRepositoryDistributionOptions) => {
    cy.hubPostRequest({
      ...options,
      url: pulpAPI`/distributions/ansible/ansible/`,
      body: {
        name: randomE2Ename(),
        base_path: randomLowercaseString(32),
        ...options?.distribution,
      },
    });
  }
);
export type HubDeleteRepositoryDistributionOptions = { pulp_href: string } & Omit<
  HubDeleteRequestOptions,
  'url'
>;
Cypress.Commands.add(
  'deleteHubRepositoryDistributionByName',
  (name: string, options?: Omit<HubDeleteRequestOptions, 'url'>) => {
    cy.hubGetRequest<PulpItemsResponse<{ pulp_href: string }>>({
      url: pulpAPI`/distributions/ansible/ansible/?name=${name}`,
    }).then((response) => {
      cy.hubDeleteRequest({ ...options, url: response.body.results[0].pulp_href });
    });
  }
);

// HUB Namespace Commands
export type HubQueryNamespacesOptions = { qs?: { limit?: number } } & Omit<
  HubGetRequestOptions,
  'url'
>;
export type HubCreateNamespaceOptions = { namespace: Partial<HubNamespace> } & Omit<
  HubPostRequestOptions,
  'url' | 'body'
>;

Cypress.Commands.add('createHubNamespace', (options?: HubCreateNamespaceOptions) => {
  cy.hubPostRequest({
    ...options,
    url: hubAPI`/_ui/v1/namespaces/`,
    body: { name: randomE2Ename(), ...options?.namespace },
  });
});

export type HubDeleteNamespaceOptions = { name: string } & Omit<HubDeleteRequestOptions, 'url'>;

Cypress.Commands.add('deleteHubNamespace', (options: HubDeleteNamespaceOptions) => {
  cy.hubDeleteRequest({
    ...options,
    url: hubAPI`/_ui/v1/namespaces/${options.name}/`,
  });
});

// HUB Role Commands
export type HubQueryRolesOptions = { qs?: { limit?: number } } & Omit<HubGetRequestOptions, 'url'>;
Cypress.Commands.add('queryHubRoles', (options?: HubQueryRolesOptions) => {
  cy.hubGetRequest({
    ...options,
    url: pulpAPI`/roles/`,
  });
});
export type HubCreateRoleOptions = { role: Partial<Role> } & Omit<
  HubPostRequestOptions,
  'url' | 'body'
>;

Cypress.Commands.add('createHubRole', (options?: HubCreateRoleOptions) => {
  cy.hubPostRequest({
    ...options,
    url: pulpAPI`/roles/`,
    body: {
      name: `galaxy.e2erole${randomString(4)}`,
      description: 'E2E custom role description',
      permissions: ['galaxy.add_namespace', 'container.namespace_change_containerdistribution'],
      ...options?.role,
    },
  });
});

export type HubDeleteRoleOptions = { pulp_href: string } & Omit<HubDeleteRequestOptions, 'url'>;

Cypress.Commands.add('deleteHubRole', (options: HubDeleteRoleOptions) => {
  const pulpUUID = parsePulpIDFromURL(options.pulp_href);
  cy.hubDeleteRequest({
    ...options,
    url: pulpAPI`/roles/${pulpUUID ?? ''}/`,
  });
});

// HUB Remote Commands
export type HubQueryRemotesOptions = { qs?: { limit?: number } } & Omit<
  HubGetRequestOptions,
  'url'
>;
Cypress.Commands.add('queryHubRemotes', (options?: HubQueryRemotesOptions) => {
  cy.hubGetRequest({
    ...options,
    url: pulpAPI`/remotes/ansible/collection/`,
  });
});
export type HubCreateRemoteOptions = { remote: Partial<HubRemote> } & Omit<
  HubPostRequestOptions,
  'url' | 'body'
>;

Cypress.Commands.add('createHubRemote', (options?: HubCreateRemoteOptions) => {
  cy.hubPostRequest({
    ...options,
    url: pulpAPI`/remotes/ansible/collection/`,
    body: {
      name: randomE2Ename(),
      url: 'https://console.redhat.com/api/automation-hub/',
      ...options?.remote,
    },
  });
});

export type HubDeleteRemoteOptions = { pulp_href: string } & Omit<HubDeleteRequestOptions, 'url'>;

Cypress.Commands.add('deleteHubRemote', (options: HubDeleteRemoteOptions) => {
  const pulpUUID = parsePulpIDFromURL(options.pulp_href);
  cy.hubDeleteRequest({
    ...options,
    url: pulpAPI`/remotes/ansible/collection/${pulpUUID ?? ''}/`,
  });
});

// HUB Collection Commands
Cypress.Commands.add('getHubCollection', (name: string) => {
  return cy
    .requestGet<
      HubItemsResponse<CollectionVersionSearch>
    >(hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}`)
    .then((itemsResponse) => itemsResponse.data[0]);
});

export type HubDeleteCollectionOptions = {
  repository?: { name: string };
  collection_version?: { name: string; namespace: string };
} & Omit<HubDeleteRequestOptions, 'url'>;

Cypress.Commands.add('deleteHubCollection', (options: HubDeleteCollectionOptions) => {
  cy.hubDeleteRequest({
    ...options,
    url: hubAPI`/v3/plugin/ansible/content/${
      options.repository?.name ?? 'community'
    }/collections/index/${options.collection_version?.namespace ?? ''}/${
      options.collection_version?.name ?? ''
    }/`,
  });
});

Cypress.Commands.add('deleteHubCollectionByName', (name: string) => {
  cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${name}`
  ).then((itemsResponse) => {
    //itemsResponse is an array that can return more than one item with the same name
    //the following code is written to prevent multiple DELETE requests of a collection
    //with the same name. Without this code, the DELETE request would be made twice
    //on the same collection, resulting in an API error
    for (const collection of itemsResponse.data) {
      const repeatedName = itemsResponse.data[0]?.collection_version?.name;
      if (collection?.collection_version?.name === repeatedName) {
        cy.deleteHubCollection(collection);
        break;
      } else {
        cy.deleteHubCollection(collection);
      }
    }
  });
});
