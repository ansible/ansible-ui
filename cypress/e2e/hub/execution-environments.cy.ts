import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { RemoteRegistry } from '@ansible/hub-ui/administration/remote-registries/RemoteRegistry';
import { HubItemsResponse } from '@ansible/hub-ui/common/useHubView';
import { ExecutionEnvironment } from '@ansible/hub-ui/execution-environments/ExecutionEnvironment';
import { ExecutionEnvironmentImage } from '@ansible/hub-ui/execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImage';
import { hubAPI } from '../../support/formatApiPathForHub';
import { ExecutionEnvironments } from './constants';

function sumLayers(layers: { size: number }[]): number {
  return layers.reduce((acc, curr) => acc + curr.size, 0);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0';
  if (!+bytes) return '';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

describe('Execution Environments', () => {
  it('should open a new tab and verify correct docs url', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: { registry: remoteRegistry.id },
      }).then((executionEnvironment) => {
        cy.navigateTo('hub', ExecutionEnvironments.url);
        cy.get('[data-cy="push-container-images"]').click();
        cy.contains('.pf-v5-c-modal-box__title-text', 'Push container images');
        cy.contains('.pf-v5-c-modal-box__footer a', 'Documentation').should(
          'have.attr',
          'href',
          'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/'
        );
        cy.deleteHubExecutionEnvironment(executionEnvironment);
        cy.deleteHubRemoteRegistry(remoteRegistry);
      });
    });
  });

  it('can add, edit, and delete a new execution environment', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      const eeName = `execution_environment_${randomString(3, undefined, { isLowercase: true })}`;
      const upstreamName = `upstream_name_${randomString(3, undefined, { isLowercase: true })}`;

      cy.navigateTo('hub', ExecutionEnvironments.url);
      cy.verifyPageTitle(ExecutionEnvironments.title);
      cy.intercept('GET', hubAPI`/_ui/v1/execution-environments/registries/?limit=50`).as(
        'registries'
      );
      cy.getByDataCy('create-execution-environment').click();
      cy.wait('@registries')
        .its('response.body.data.length')
        .then((count) => {
          cy.getByDataCy('name').type(eeName);
          cy.getByDataCy('upstream-name').type(upstreamName);
          cy.getBy('#registry')
            .click()
            .then(() => {
              //This element renders differently depending on how many registries the API returns
              if (count < 11) {
                //fewer than 11 remote registries
                cy.contains('button[type="button"]', remoteRegistry.name).click();
              } else if (count > 10 && count < 50) {
                //between 11 and 49 remote registries
                cy.getByDataCy('dropdown-menu')
                  .find('input')
                  .type(remoteRegistry.name)
                  .then(() => {
                    cy.containsBy('button', `${remoteRegistry.name}`).click();
                  });
              } else {
                //50 or more remote registries
                cy.filterTableBySingleText(remoteRegistry.name);
                cy.getByDataCy('checkbox-column-cell').find('input').click();
                cy.containsBy('button', 'Confirm').click();
              }
            });
          cy.getByDataCy('Submit').click();
          cy.url().should('contain', '/execution-environments/');
          cy.filterTableBySingleText(eeName);
          cy.get('tbody').find('tr').should('have.length', 1);
          // edit ee
          cy.get('tbody').within(() => {
            cy.getByDataCy('name-column-cell').should('contain', eeName);
            cy.get('[data-cy="edit-execution-environment"]').click();
          });
          cy.get('[data-cy="description"]').click().type('nice new description');
          cy.get('[data-cy="upstream-name"]').click().clear().type('pulp/pulp-fixtures/new');
          cy.getByDataCy('Submit').click();
          cy.url().should('contain', '/execution-environments/');
          cy.filterTableBySingleText(eeName);
          cy.get('[data-cy="description-column-cell"]').should('contain', 'nice new description');
          cy.get('tbody').within(() => {
            cy.getByDataCy('name-column-cell').should('contain', eeName);
            cy.get('[data-cy="edit-execution-environment"]').click();
          });
          cy.get('[data-cy="upstream-name"]').click().clear().type(upstreamName);
          cy.getByDataCy('Submit').click();
          // delete ee
          cy.filterTableBySingleText(eeName);
          cy.get('tbody').within(() => {
            cy.getByDataCy('name-column-cell').should('contain', eeName);
            cy.get('[data-cy="actions-dropdown"]').click();
          });
          cy.get(`[data-cy="delete-execution-environment"]`).click();
          cy.get('[data-ouia-component-id="Permanently delete execution environments"]').within(
            () => {
              cy.get('[data-ouia-component-id="confirm"]').click();
              cy.get('[data-ouia-component-id="submit"]').click();
              cy.containsBy('button', 'Close').click();
            }
          );
          cy.contains('No results found');
          cy.get('[class*="empty-state__content"]')
            .should('exist')
            .should(
              'contain',
              'No results match this filter criteria. Clear all filters and try again.'
            );
          cy.deleteHubRemoteRegistry({ id: remoteRegistry.id });
        });
    });
  });
});

describe('Execution Environment Details tab', () => {
  let remoteRegistry: RemoteRegistry;
  let executionEnvironment: ExecutionEnvironment;

  before(() => {
    cy.createHubRemoteRegistry().then((response) => {
      remoteRegistry = response;
      cy.createHubExecutionEnvironment({
        executionEnvironment: { registry: remoteRegistry.id },
      }).then((response) => {
        executionEnvironment = response;
      });
    });
  });

  after(() => {
    cy.deleteHubExecutionEnvironment(executionEnvironment);
    cy.deleteHubRemoteRegistry(remoteRegistry);
  });

  it('should render the execution environment details page', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle('Execution Environments');
    cy.get('[data-cy="text-input"]')
      .should('be.visible')
      .within(() => {
        cy.get('input').clear().type(executionEnvironment.name);
      });
    cy.contains('.pf-v5-c-chip__text', executionEnvironment.name);
    cy.get('a').contains(executionEnvironment.name).click();
    cy.verifyPageTitle(executionEnvironment.name);
    cy.getBy('[data-cy="execution-environment-details-tab"]').should('contain', 'Details');
    cy.getBy('[data-cy="execution-environment-activity-tab"]').should('contain', 'Activity');
    cy.getBy('[data-cy="execution-environment-images-tab"]').should('contain', 'Images');
    cy.getBy('[data-cy="execution-environment-access-tab"]').should('contain', 'Team Access');
    cy.getBy('[data-cy="execution-environment-user-access-tab"]').should('contain', 'User Access');
    cy.get('[aria-selected="true"]').contains('Details');
  });

  it('should render details page tab with instructions and empty readme', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle('Execution Environments');
    cy.get('[data-cy="text-input"]')
      .should('be.visible')
      .within(() => {
        cy.get('input').clear().type(executionEnvironment.name);
      });
    cy.contains('.pf-v5-c-chip__text', executionEnvironment.name);
    cy.get('a').contains(executionEnvironment.name).click();
    cy.verifyPageTitle(executionEnvironment.name);
    cy.get('[aria-selected="true"]').contains('Details');
    cy.contains('Instructions');
    cy.contains('Pull this image');
    const host = window.location.host;
    const instructions = `podman pull ${host}/${executionEnvironment.name}`;
    cy.get('[data-cy="clipboard-copy"] input').should('have.value', instructions);
    cy.get('[data-cy="clipboard-copy"] input').should('have.attr', 'readonly', 'readonly');
    cy.contains('No README');
    cy.contains('Add a README with instructions for using this container.');
    cy.get('[data-cy="add-readme"]').contains('Add');
  });

  it('should add readme with markdown editor', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle('Execution Environments');
    cy.get('[data-cy="text-input"]')
      .should('be.visible')
      .within(() => {
        cy.get('input').clear().type(executionEnvironment.name);
      });
    cy.contains('.pf-v5-c-chip__text', executionEnvironment.name);
    cy.get('a').contains(executionEnvironment.name).click();
    cy.verifyPageTitle(executionEnvironment.name);
    cy.containsBy('button', 'Add').click();
    cy.contains('README');
    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Raw Markdown');
      cy.contains('Preview');
      cy.getByDataCy('raw-markdown').type('# Heading 1');
      cy.contains('Preview').parent().get('h1').contains('Heading 1');
      cy.contains('Cancel');
      cy.intercept(
        'PUT',
        hubAPI`/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
      ).as('updateReadme');
      cy.containsBy('button', 'Save').click();
      cy.wait('@updateReadme');
    });
    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
  });

  it('should change readme after editing', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle('Execution Environments');
    cy.get('[data-cy="text-input"]')
      .should('be.visible')
      .within(() => {
        cy.get('input').clear().type(executionEnvironment.name);
      });
    cy.contains('.pf-v5-c-chip__text', executionEnvironment.name);
    cy.get('a').contains(executionEnvironment.name).click();
    cy.verifyPageTitle(executionEnvironment.name);
    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Heading 1');
      cy.containsBy('button', 'Edit').click();
      cy.getByDataCy('raw-markdown').type('{enter}**bold text**');
      cy.contains('Preview').parent().get('strong').contains('bold text');
      cy.intercept(
        'PUT',
        hubAPI`/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/readme/`
      ).as('updateReadme');
      cy.containsBy('button', 'Save').click();
      cy.wait('@updateReadme');
    });
    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
    cy.get('[data-cy="readme"]').get('strong').contains('bold text');
  });

  it('should not change readme after cancel edit', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle('Execution Environments');
    cy.get('[data-cy="text-input"]')
      .should('be.visible')
      .within(() => {
        cy.get('input').clear().type(executionEnvironment.name);
      });
    cy.contains('.pf-v5-c-chip__text', executionEnvironment.name);
    cy.get('a').contains(executionEnvironment.name).click();
    cy.verifyPageTitle(executionEnvironment.name);
    cy.get('[data-cy="readme"]').within(() => {
      cy.containsBy('button', 'Edit').click();
      cy.getByDataCy('raw-markdown').clear().type('{enter}this should not be saved.');
      cy.contains('Preview').parent().contains('this should not be saved.');
      cy.containsBy('button', 'Cancel').click();
    });
    cy.get('[data-cy="readme"]').contains('this should not be saved.').should('not.exist');
  });

  it.skip('should successfully sync execution environment from Docker registry', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: {
          registry: remoteRegistry.id,
        },
      }).then((executionEnvironment) => {
        cy.syncRemoteExecutionEnvironment(executionEnvironment);
        cy.deleteHubExecutionEnvironment(executionEnvironment).then(() => {
          cy.deleteHubRemoteRegistry(remoteRegistry);
        });
      });
    });
  });
});

describe('Execution Environment Activity and Image tabs', () => {
  it('should display empty activity tab', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: { registry: remoteRegistry.id },
      }).then((executionEnvironment) => {
        cy.navigateTo('hub', ExecutionEnvironments.url);
        cy.verifyPageTitle('Execution Environments');
        cy.get('[data-cy="text-input"]')
          .should('be.visible')
          .within(() => {
            cy.get('input').clear().type(executionEnvironment.name);
          });
        cy.contains('.pf-v5-c-chip__text', executionEnvironment.name);
        cy.get('a').contains(executionEnvironment.name).click();
        cy.verifyPageTitle(executionEnvironment.name);
        cy.getByDataCy('execution-environment-activity-tab').click();
        cy.contains('No activities yet');
        cy.contains('Activities will appear once you push something');
        cy.deleteHubExecutionEnvironment(executionEnvironment).then(() => {
          cy.deleteHubRemoteRegistry(remoteRegistry);
        });
      });
    });
  });

  it.skip('should display populated activity and images tabs', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: {
          include_tags: ['latest'],
          registry: remoteRegistry.id,
        },
      }).then((executionEnvironment) => {
        cy.syncRemoteExecutionEnvironment(executionEnvironment);

        const eeName = executionEnvironment.name;
        cy.intercept(
          'GET',
          hubAPI`/v3/plugin/execution-environments/repositories/${eeName}/_content/history/*`
        ).as('getActivity');
        cy.navigateTo('hub', ExecutionEnvironments.url);
        cy.verifyPageTitle('Execution Environments');
        cy.get('[data-cy="text-input"]')
          .should('be.visible')
          .within(() => {
            cy.get('input').clear().type(executionEnvironment.name);
          });
        cy.contains('.pf-v5-c-chip__text', executionEnvironment.name);
        cy.get('a').contains(executionEnvironment.name).click();
        cy.verifyPageTitle(executionEnvironment.name);
        cy.getByDataCy('execution-environment-activity-tab').click();
        cy.contains('Change');
        cy.contains('Date');
        cy.contains(`${eeName} was added`);
        cy.contains('sha256');
        cy.contains('latest was added');
        cy.wait('@getActivity');
        cy.getByDataCy('execution-environment-images-tab').click();
        cy.get('tbody tr').should('have.length', 1);
        cy.get('button[aria-label="Copy to clipboard"]').click();
        cy.get('[data-cy="alert-toaster"]').should('be.visible');
        cy.get('[data-cy="alert-toaster"]').within(() => {
          cy.get('button').click();
        });
        cy.requestGet<HubItemsResponse<ExecutionEnvironmentImage>>(
          hubAPI`/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/images/?exclude_child_manifests=true&offset=0&limit=10`
        ).then((res) => {
          expect(res?.data).to.have.length(1);
          const image: ExecutionEnvironmentImage = res.data[0];
          const { updated_at, tags, layers } = image;
          cy.get('[data-cy="tag-column-cell"]').within(() => {
            tags.forEach((tag) => {
              cy.get('li').contains(tag).should('exist');
            });
          });
          const createdDate = new Date(updated_at);
          const formattedDateTime = `${createdDate.toLocaleDateString()}, ${createdDate.toLocaleTimeString()}`;
          cy.get('[data-cy="published-column-cell"]')
            .invoke('text')
            .then((text) => {
              expect(text).to.include(formattedDateTime);
            });
          cy.get('[data-cy="layers-column-cell"]')
            .invoke('text')
            .then((text) => {
              expect(text.trim()).to.equal(layers.length.toString());
            });
          cy.get('[data-cy="size-column-cell"]')
            .invoke('text')
            .then((text) => {
              const totalSize: number = sumLayers(layers);
              const formattedSize: string = formatBytes(totalSize);
              expect(text.trim()).to.equal(formattedSize);
            });
        });
        cy.get('[data-cy="digest-column-cell"]').within(() => {
          cy.requestGet<HubItemsResponse<ExecutionEnvironmentImage>>(
            hubAPI`/v3/plugin/execution-environments/repositories/${executionEnvironment.name}/_content/images/?exclude_child_manifests=true&offset=0&limit=10`
          ).then((res) => {
            expect(res?.data).to.have.length(1);
            const image: ExecutionEnvironmentImage = res.data[0];
            const { digest } = image;
            cy.get('a')
              .should('have.attr', 'href')
              .then((hrefAttr) => {
                {
                  typeof hrefAttr === 'string' &&
                    expect(decodeURIComponent(hrefAttr)).to.include(
                      `/execution-environments/${executionEnvironment.name}/images/${digest}/`
                    );
                }
              });
            cy.get('a span.pf-v5-c-label__text')
              .invoke('text')
              .then((text) => {
                const truncatedDigest = digest.substring(0, 12);
                expect(text.trim()).to.match(new RegExp(`^${truncatedDigest}`));
              });
          });
        });
        cy.deleteHubExecutionEnvironment(executionEnvironment).then(() => {
          cy.deleteHubRemoteRegistry(remoteRegistry);
        });
      });
    });
  });
});
