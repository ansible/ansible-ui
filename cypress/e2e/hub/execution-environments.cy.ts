import { randomString } from '../../../framework/utils/random-string';
import { RemoteRegistry } from '../../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { ExecutionEnvironment } from '../../../frontend/hub/execution-environments/ExecutionEnvironment';
import { hubAPI } from '../../support/formatApiPathForHub';
import { ExecutionEnvironments } from './constants';

describe('Execution Environments', () => {
  it('can render the execution environments page', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
  });

  it('should open a new tab and verify correct docs url', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: { registry: remoteRegistry.id },
      }).then((executionEnvironment) => {
        cy.navigateTo('hub', ExecutionEnvironments.url);
        cy.window().then((win) => cy.stub(win, 'open').as('docsTab'));
        cy.get('[data-cy="push-container-images"]').click();
        cy.get('@docsTab').should(
          'be.calledWith',
          'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/'
        );
        cy.deleteHubExecutionEnvironment(executionEnvironment);
        cy.deleteHubRemoteRegistry(remoteRegistry);
      });
    });
  });

  it('can add and delete a new execution environment', () => {
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
          cy.contains('[data-ouia-component-id="menu-select"]', 'Select registry')
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
          cy.contains('h2', 'No results found').should('be.visible');
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
    // test navigating by sidebar menu
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.filterTableBySingleText(executionEnvironment.name);
    cy.get('a').contains(executionEnvironment.name).click();
    cy.verifyPageTitle(executionEnvironment.name);
    cy.contains('Unsigned');

    const tabs = ['Details', 'Activity', 'Images', 'Access'];
    tabs.forEach((tab) => {
      cy.contains(tab);
    });
    cy.get('[aria-selected="true"]').contains('Details');
  });

  it('should render details page tab with instructions and empty readme', () => {
    // test visiting by URL
    cy.visit(`/execution-environments/${executionEnvironment.name}/`);
    cy.verifyPageTitle(executionEnvironment.name);
    cy.get('[aria-selected="true"]').contains('Details');
    cy.contains('Instructions');
    cy.contains('Pull this image');

    // in dev env should be 'localhost:4102'
    const host = window.location.host;
    const instructions = `podman pull ${host}/${executionEnvironment.name}`;
    cy.get('[data-cy="clipboard-copy"] input').should('have.value', instructions);
    cy.get('[data-cy="clipboard-copy"] input').should('have.attr', 'readonly', 'readonly');
    cy.contains('No README');
    cy.contains('Add a README with instructions for using this container.');
    cy.get('[data-cy="add-readme"]').contains('Add');
  });

  it('should add readme with markdown editor', () => {
    cy.visit(`/execution-environments/${executionEnvironment.name}/`);
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
    cy.visit(`/execution-environments/${executionEnvironment.name}/`);
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
    cy.visit(`/execution-environments/${executionEnvironment.name}/`);
    cy.get('[data-cy="readme"]').within(() => {
      cy.containsBy('button', 'Edit').click();
      cy.getByDataCy('raw-markdown').clear().type('{enter}this should not be saved.');
      cy.contains('Preview').parent().contains('this should not be saved.');
      cy.containsBy('button', 'Cancel').click();
    });
    cy.get('[data-cy="readme"]').contains('this should not be saved.').should('not.exist');
  });

  it('should successfully sync execution environment from Docker registry', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: {
          include_tags: ['latest'],
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

describe('Execution Environment Activity tab', () => {
  it('should display empty activity tab', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: { registry: remoteRegistry.id },
      }).then((executionEnvironment) => {
        cy.visit(`${ExecutionEnvironments.url}/${executionEnvironment.name}/activity`);
        cy.contains('No activities yet');
        cy.contains('Activities will appear once you push something');

        cy.deleteHubExecutionEnvironment(executionEnvironment).then(() => {
          cy.deleteHubRemoteRegistry(remoteRegistry);
        });
      });
    });
  });

  it('should display populated activity tab', () => {
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
        cy.visit(`${ExecutionEnvironments.url}/${eeName}/activity`);
        cy.contains('Change');
        cy.contains('Date');
        cy.contains(`${eeName} was added`);
        cy.contains('sha256');
        cy.contains('latest was added');
        cy.wait('@getActivity');

        cy.deleteHubExecutionEnvironment(executionEnvironment).then(() => {
          cy.deleteHubRemoteRegistry(remoteRegistry);
        });
      });
    });
  });
});
