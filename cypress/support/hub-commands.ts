/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import shell from 'shell-escape-tag';
import './commands';
import './rest-commands';
import { HubItemsResponse } from '../../frontend/hub/useHubView';
import { CollectionVersionSearch } from '../../frontend/hub/collections/CollectionVersionSearch';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

// GalaxyKit Integration: To invoke `galaxykit` commands for generating resources
Cypress.Commands.add('galaxykit', (operation: string, ...args: string[]) => {
  const adminUsername = Cypress.env('HUB_USERNAME') as string;
  const adminPassword = Cypress.env('HUB_PASSWORD') as string;
  const galaxykitCommand = Cypress.env('HUB_GALAXYKIT_COMMAND') as string;
  const server = (Cypress.env('HUB_SERVER') as string) + apiPrefix;
  const options = { failOnNonZeroExit: false };

  cy.log(`${galaxykitCommand} ${operation} ${args.join(' ')}`);

  const cmd = shell`${shell.preserve(
    galaxykitCommand
  )} -s ${server} -u ${adminUsername} -p ${adminPassword} ${shell.preserve(
    operation
  )} ${args}` as string;

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
      if (maxLoops == 0) {
        cy.log('Max loops reached while waiting for the approved collection.');
        return;
      }

      cy.wait(300);

      cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
        `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=${namespaceName}&name=${collectionName}`
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
        `-i collection upload ${namespaceName} ${collectionName} --tags ${tags.join(' ')}`
      );
    } else {
      cy.galaxykit(`-i collection upload ${namespaceName} ${collectionName}`);
    }

    waitTillPublished(10);

    // TODO for Insights mode
    // if (insightsLogin) {
    //   cy.galaxykit(`-i collection move ${namespace} ${collection}`);
    // }
  }
);

Cypress.Commands.add('deleteNamespace', (namespaceName: string) => {
  cy.galaxykit(`namespace delete ${namespaceName}`);
});

Cypress.Commands.add('deleteCollectionsInNamespace', (namespaceName: string) => {
  cy.requestGet<HubItemsResponse<CollectionVersionSearch>>(
    `${apiPrefix}v3/plugin/ansible/search/collection-versions/?namespace=${namespaceName}`
  ).then((itemsResponse) => {
    cy.log(`count of collections in namespace: ${itemsResponse.data.length}`);
    for (const collection of itemsResponse.data) {
      cy.galaxykit(
        'collection delete',
        collection.collection_version.namespace,
        collection.collection_version.name,
        collection.collection_version.version,
        collection.repository.name
      );
    }
  });
});
