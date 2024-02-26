/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { randomString } from '../../framework/utils/random-string';
import { Role } from '../../frontend/hub/access/roles/Role';
import { RemoteRegistry } from '../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { Task } from '../../frontend/hub/administration/tasks/Task';
import { CollectionVersionSearch } from '../../frontend/hub/collections/Collection';
import { parsePulpIDFromURL } from '../../frontend/hub/common/api/hub-api-utils';
import { HubItemsResponse } from '../../frontend/hub/common/useHubView';
import { ExecutionEnvironment as HubExecutionEnvironment } from '../../frontend/hub/execution-environments/ExecutionEnvironment';
import { galaxykitPassword, galaxykitUsername } from './e2e';
import { hubAPI, pulpAPI } from './formatApiPathForHub';
import { escapeForShellCommand } from './utils';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

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
    cy.selectToolbarFilterType('Namespace');
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

Cypress.Commands.add('getOrCreateCollection', () => {
  let newCollectionVersion;
  cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=spm_toolbox&offset=0&limit=10`
  ).then((result) => {
    const collectionA = result.data.length;
    cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
      hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=ds8000&offset=0&limit=10`
    ).then((result) => {
      const collectionB = result.data.length;
      cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
        hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=operator_collection_sdk&offset=0&limit=10`
      ).then((result) => {
        const collectionC = result.data.length;
        cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
          hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=ibm_zosmf&offset=0&limit=10`
        ).then((result) => {
          const collectionD = result.data.length;
          cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
            hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=mas_airgap&offset=0&limit=10`
          ).then((result) => {
            const collectionE = result.data.length;
            cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
              hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=qradar&offset=0&limit=10`
            ).then((result) => {
              const collectionF = result.data.length;
              if (collectionA === 0) {
                newCollectionVersion = 'ibm-spm_toolbox-1.0.2.tar.gz';
                return newCollectionVersion;
              } else if (collectionB === 0) {
                newCollectionVersion = 'ibm-ds8000-1.1.0.tar.gz';
                return newCollectionVersion;
              } else if (collectionC === 0) {
                newCollectionVersion = 'ibm-operator_collection_sdk-1.1.0.tar.gz';
                return newCollectionVersion;
              } else if (collectionD === 0) {
                newCollectionVersion = 'ibm-ibm_zosmf-1.4.1.tar.gz';
                return newCollectionVersion;
              } else if (collectionE === 0) {
                newCollectionVersion = 'ibm-mas_airgap-2.6.2.tar.gz';
                return newCollectionVersion;
              } else if (collectionF === 0) {
                newCollectionVersion = 'ibm-qradar-3.0.0.tar.gz';
                return newCollectionVersion;
              } else {
                return 'All test collections currently exist. Please delete one or more and re-run the test.';
              }
            });
          });
        });
      });
    });
  });
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

Cypress.Commands.add('createHubRole', () => {
  cy.requestPost<Pick<Role, 'name' | 'description' | 'permissions'>, Role>(pulpAPI`/roles/`, {
    name: `galaxy.e2erole${randomString(4)}`,
    description: 'E2E custom role description',
    permissions: ['galaxy.add_namespace', 'container.namespace_change_containerdistribution'],
  });
});

Cypress.Commands.add(
  'deleteHubRole',
  (
    role: Role,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (role?.name) {
      cy.requestDelete(pulpAPI`/roles/${parsePulpIDFromURL(role.pulp_href) as string}/`, options);
    }
  }
);

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

Cypress.Commands.add('uploadCollection', (collection: string, namespace: string) => {
  cy.galaxykit(`collection upload ${namespace} ${collection}`);
});

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

Cypress.Commands.add(
  'createHubExecutionEnvironment',
  (executionEnvironment: Partial<HubExecutionEnvironment>) => {
    cy.requestPost(hubAPI`/_ui/v1/execution-environments/remotes/`, {
      name: `e2e-${randomString(4, undefined, { isLowercase: true })}`,
      upstream_name: 'alpine',
      ...executionEnvironment,
    });
  }
);

Cypress.Commands.add(
  'deleteHubExecutionEnvironment',
  (executionEnvironmentName: string, options?: { failOnStatusCode?: boolean }) => {
    cy.requestDelete(
      hubAPI`/v3/plugin/execution-environments/repositories/${executionEnvironmentName}/`,
      options
    ).then((response) => {
      if (response.status === 202) {
        const body = response.body as { task: string };
        cy.waitOnHubTask(body.task);
      }
    });
  }
);

Cypress.Commands.add('createHubRemoteRegistry', (remoteRegistry?: Partial<RemoteRegistry>) => {
  cy.requestPost(hubAPI`/_ui/v1/execution-environments/registries/`, {
    name: `e2e-${randomString(4, undefined, { isLowercase: true })}`,
    url: 'https://registry.hub.docker.com/',
    ...remoteRegistry,
  });
});

Cypress.Commands.add(
  'deleteHubRemoteRegistry',
  (remoteRegistryId: string, options?: { failOnStatusCode?: boolean }) => {
    cy.requestDelete(
      hubAPI`/_ui/v1/execution-environments/registries/${remoteRegistryId}/`,
      options
    );
  }
);

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
