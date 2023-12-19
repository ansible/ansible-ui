/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { randomString } from '../../framework/utils/random-string';
import { Role } from '../../frontend/hub/access/roles/Role';
import { parsePulpIDFromURL } from '../../frontend/hub/api/utils';
import { CollectionVersionSearch } from '../../frontend/hub/collections/Collection';
import { HubNamespace } from '../../frontend/hub/namespaces/HubNamespace';
import { HubItemsResponse } from '../../frontend/hub/useHubView';
import './commands';
import { hubAPI, pulpAPI } from './formatApiPathForHub';
import './rest-commands';
import { escapeForShellCommand } from './utils';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

// GalaxyKit Integration: To invoke `galaxykit` commands for generating resources
Cypress.Commands.add('galaxykit', (operation: string, ...args: string[]) => {
  const adminUsername = Cypress.env('HUB_USERNAME') as string;
  const adminPassword = Cypress.env('HUB_PASSWORD') as string;
  const galaxykitCommand =
    (Cypress.env('HUB_GALAXYKIT_COMMAND') as string) ?? 'galaxykit --ignore-certs';
  const server = (Cypress.env('HUB_SERVER') as string) + apiPrefix;
  const options = { failOnNonZeroExit: false };

  cy.log(`${galaxykitCommand} ${operation} ${args.join(' ')}`);

  const cmd = `${galaxykitCommand} -s '${server}' -u '${adminUsername}' -p '${adminPassword}' ${operation} ${escapeForShellCommand(
    args
  )}`;

  cy.exec(cmd, options).then(({ code, stderr, stdout }) => {
    cy.log(`RUN ${cmd}`, code, stderr, stdout).then(() => {
      if (code || stderr) {
        cy.log('galaxykit code: ' + code.toString()).then(() => {
          cy.log('galaxykit stderr: ' + stderr).then(() => {
            throw new Error(`Galaxykit failed: ${stderr}`);
          });
        });
      }
    });

    cy.log(`stdout: ${stdout}`).then(() => {
      return stdout.split('\n').filter((s) => !!s);
    });
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

Cypress.Commands.add('uploadHubCollectionFile', (hubFilePath: string, hubFileName: string) => {
  cy.fixture(hubFilePath, 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((fileContent) => {
      cy.get('input[id="file-upload-file-filename"]').attachFile(
        {
          fileContent,
          fileName: hubFileName,
          filePath: hubFilePath,
          mimeType: 'application/gzip',
        },
        { subjectType: 'drag-n-drop' }
      );
    });
});

Cypress.Commands.add('getOrCreateCollection', () => {
  let newCollectionVersion;
  cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
    `/api/galaxy/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=zos_zoau_operator&offset=0&limit=10`
  ).then((result) => {
    const collectionA = result.data.length;
    cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
      `/api/galaxy/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=zos_cics_operator&offset=0&limit=10`
    ).then((result) => {
      const collectionB = result.data.length;
      cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
        `/api/galaxy/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=spm_toolbox&offset=0&limit=10`
      ).then((result) => {
        const collectionC = result.data.length;
        cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
          `/api/galaxy/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=ds8000&offset=0&limit=10`
        ).then((result) => {
          const collectionD = result.data.length;
          cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
            `/api/galaxy/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=operator_collection_sdk&offset=0&limit=10`
          ).then((result) => {
            const collectionE = result.data.length;

            if (collectionA === 0) {
              newCollectionVersion = 'ibm-zos_zoau_operator-1.0.3.tar.gz';
              return newCollectionVersion;
            } else if (collectionB === 0) {
              newCollectionVersion = 'ibm-zos_cics_operator-1.0.1.tar.gz';
              return newCollectionVersion;
            } else if (collectionC === 0) {
              newCollectionVersion = 'ibm-spm_toolbox-1.0.2.tar.gz';
              return newCollectionVersion;
            } else if (collectionD === 0) {
              newCollectionVersion = 'ibm-ds8000-1.1.0.tar.gz';
              return newCollectionVersion;
            } else if (collectionE === 0) {
              newCollectionVersion = 'ibm-operator_collection_sdk-1.1.0.tar.gz';
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

Cypress.Commands.add('createNamespace', (namespaceName: string) => {
  cy.requestPost(hubAPI`/_ui/v1/namespaces/`, {
    name: namespaceName,
    groups: [],
  });
});

Cypress.Commands.add('getNamespace', (namespaceName: string) => {
  cy.requestGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?name=${namespaceName}`
  ).then((itemsResponse) => {
    if (itemsResponse.data.length === 0) {
      cy.createNamespace(namespaceName);
    } else {
      cy.log('Namespace Exists');
    }
  });
});

Cypress.Commands.add('deleteNamespace', (namespaceName: string) => {
  cy.galaxykit('namespace delete', namespaceName);
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
      cy.requestDelete(pulpAPI`/roles/${parsePulpIDFromURL(role.pulp_href) as string}`, options);
    }
  }
);

Cypress.Commands.add('createRemote', (remoteName: string) => {
  cy.requestPost(pulpAPI`/remotes/ansible/collection/`, {
    name: remoteName,
    url: 'https://console.redhat.com/api/automation-hub/',
  });
});

Cypress.Commands.add('deleteRemote', (remoteName: string) => {
  cy.requestDelete(pulpAPI`/remotes/ansible/collection/${remoteName}/`);
});

Cypress.Commands.add('createRemoteRegistry', (remoteRegistryName: string) => {
  cy.requestPost(hubAPI`/_ui/v1/execution-environments/registries/`, {
    name: remoteRegistryName,
    url: 'https://console.redhat.com/api/automation-hub/',
  });
});

Cypress.Commands.add('deleteRemoteRegistry', (remoteRegistryId: string) => {
  cy.requestDelete(hubAPI`/_ui/v1/execution-environments/registries/${remoteRegistryId}/`);
});
