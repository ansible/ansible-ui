/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { SetRequired } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import { Role } from '../../frontend/hub/access/roles/Role';
import { RemoteRegistry } from '../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { HubRemote } from '../../frontend/hub/administration/remotes/Remotes';
import { Repository } from '../../frontend/hub/administration/repositories/Repository';
import { Task } from '../../frontend/hub/administration/tasks/Task';
import { CollectionVersionSearch } from '../../frontend/hub/collections/Collection';
import { parsePulpIDFromURL } from '../../frontend/hub/common/api/hub-api-utils';
import { HubItemsResponse } from '../../frontend/hub/common/useHubView';
import { ExecutionEnvironment as HubExecutionEnvironment } from '../../frontend/hub/execution-environments/ExecutionEnvironment';
import { HubNamespace } from '../../frontend/hub/namespaces/HubNamespace';
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
Cypress.Commands.add('hubPutRequest', (options: HubPutRequestOptions) => {
  cy.hubRequest({ ...options, method: 'PUT' });
});

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
Cypress.Commands.add('hubPatchRequest', (options: HubPatchRequestOptions) => {
  cy.hubRequest({ ...options, method: 'PATCH' });
});

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
  cy.get('#file-upload-file-browse-button').click();
  cy.get('input[id="file-upload-file-filename"]').selectFile(hubFilePath, {
    action: 'drag-drop',
  });
});

Cypress.Commands.add('addAndApproveMultiCollections', (numberOfCollections = 1) => {
  const rand = Math.floor(Math.random() * 9999999);
  const namespace = `foo_${rand}`;

  const uploadCollection = (namespace: string, range: number) => {
    for (let i = 0; i < range; i++) {
      const collection = `bar_${rand}${i}`;
      cy.galaxykit(`-i collection upload ${namespace} ${collection}`);
    }
  };

  const approveMultiCollections = (namespace: string) => {
    cy.visit('/administration/approvals?page=1&perPage=100');
    cy.verifyPageTitle('Collection Approvals');
    cy.selectToolbarFilterByLabel('Namespace');
    cy.intercept(
      'GET',
      hubAPI`/v3/plugin/ansible/search/collection-versions/?repository_label=pipeline=staging&namespace=${namespace}&order_by=namespace&offset=0&limit=100`
    ).as('approvals');
    cy.searchAndDisplayResource(`${namespace}`);
    cy.wait('@approvals');
    cy.get('[data-cy="select-all"]').click();
    cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
      cy.get('[data-cy="actions-dropdown"]')
        .click()
        .then(() => {
          cy.get('[data-cy="approve-selected-collections"]').click();
        });
    });
    cy.get('[data-ouia-component-id="Approve collections"]').within(() => {
      cy.get('[data-ouia-component-id="confirm"]').click();
      cy.get('[data-ouia-component-id="submit"]').click();
      cy.clickButton('Close');
    });
  };

  uploadCollection(namespace, numberOfCollections);
  approveMultiCollections(namespace);
});

Cypress.Commands.add(
  'deleteCommunityCollectionFromSystem',
  (
    collectionName: CollectionVersionSearch,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (collectionName) {
      const thisName = collectionName.collection_version?.name;
      cy.requestDelete(
        hubAPI`/v3/plugin/ansible/content/community/collections/index/ibm/${thisName ?? ''}/`,
        options
      );
    }
  }
);

Cypress.Commands.add('cleanupCollections', (namespace: string, repo: string) => {
  cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?namespace=${namespace}`
  ).then((result) => {
    for (const resource of result.data ?? []) {
      if (resource.repository?.name === repo) {
        cy.deleteCommunityCollectionFromSystem(resource);
      }
    }
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

Cypress.Commands.add('deleteRemote', (remoteName: string) => {
  cy.galaxykit(`remote delete ${remoteName}`);
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

Cypress.Commands.add('createRepository', (repositoryName: string, remoteName?: string) => {
  remoteName
    ? cy.galaxykit(`repository create --remote ${remoteName} ${repositoryName}`)
    : cy.galaxykit(`repository create ${repositoryName}`);
});

Cypress.Commands.add('deleteRepository', (repositoryName: string) => {
  cy.galaxykit(`repository delete ${repositoryName}`);
});

Cypress.Commands.add(
  'undeprecateCollection',
  (collection: string, namespace: string, repository: string) => {
    cy.requestPatch(
      hubAPI`/v3/plugin/ansible/content/${repository}/collections/index/${namespace}/${collection}/`,
      { deprecated: false }
    );
  }
);

// HUB Execution Environment Commands
export type HubCreateExecutionEnvironmentOptions = {
  executionEnvironment: SetRequired<Partial<HubExecutionEnvironment>, 'registry'>;
} & Omit<HubPostRequestOptions, 'url' | 'body'>;
Cypress.Commands.add(
  'createHubExecutionEnvironment',
  (options: HubCreateExecutionEnvironmentOptions) => {
    cy.hubPostRequest({
      ...options,
      url: hubAPI`/_ui/v1/execution-environments/remotes/`,
      body: {
        name: randomE2Ename(),
        upstream_name: 'alpine',
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
export type HubCreateRepositoryOptions = {
  repository: Partial<Repository>;
} & Omit<HubPostRequestOptions, 'url' | 'body'>;
Cypress.Commands.add('createHubRepository', (options?: HubCreateRepositoryOptions) => {
  cy.hubPostRequest({
    ...options,
    url: pulpAPI`/repositories/ansible/ansible/`,
    body: {
      name: randomE2Ename(),
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

// HUB Namespace Commands
export type HubCreateNamespaceOptions = { namespace: Partial<HubNamespace> } & Omit<
  HubPostRequestOptions,
  'url' | 'body'
>;
Cypress.Commands.add('createHubNamespace', (options?: HubCreateNamespaceOptions) => {
  cy.hubPostRequest({
    ...options,
    url: hubAPI`/_ui/v1/namespaces/`,
    body: {
      name: randomE2Ename(),
      ...options?.namespace,
    },
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
    for (const collection of itemsResponse.data) {
      cy.deleteHubCollection(collection);
    }
  });
});
