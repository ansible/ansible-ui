import { hubAPI } from '../../support/formatApiPathForHub';
import { ExecutionEnvironments } from './constants';
import { randomString } from '../../../framework/utils/random-string';
import { RemoteRegistry as IRemoteRegistry } from '../../../frontend/hub/administration/remote-registries/RemoteRegistry';

describe('Execution Environments', () => {
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateRemoteRegistryName(): string {
    return `test-${testSignature}-remote-registry-${randomString(5, undefined, {
      isLowercase: true,
    })}`;
  }

  before(() => {
    cy.hubLogin();
  });

  it('can render the execution environments page', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
  });

  it('should open a new tab and verify correct docs url', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.window().then((win) => {
      cy.stub(win, 'open').as('docsTab');
    });
    cy.get('[data-cy="push-container-images"]').click();
    cy.get('@docsTab').should(
      'be.calledWith',
      'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/'
    );
  });

  it('can add and delete a new execution environment', () => {
    const remoteRegistryName = generateRemoteRegistryName();
    cy.createRemoteRegistry(remoteRegistryName).then((remoteRegistry: IRemoteRegistry) => {
      const eeName = `execution_environment_${randomString(3, undefined, { isLowercase: true })}`;
      const upstreamName = `upstream_name_${randomString(3, undefined, { isLowercase: true })}`;

      cy.navigateTo('hub', ExecutionEnvironments.url);
      cy.verifyPageTitle(ExecutionEnvironments.title);
      cy.intercept('GET', hubAPI`/_ui/v1/execution-environments/registries/?limit=50`).as(
        'registries'
      );
      cy.getByDataCy('add-execution-environment').click();
      cy.wait('@registries')
        .its('response.body.data.length')
        .then((count) => {
          cy.getByDataCy('name').type(eeName);
          cy.getByDataCy('upstream-name').type(upstreamName);
          cy.contains('[data-ouia-component-id="menu-select"]', 'Select registry')
            .click()
            .then(() => {
              if (count < 11) {
                cy.contains('button[type="button"]', remoteRegistryName).click();
              } else if (count > 10 && count < 50) {
                cy.getByDataCy('dropdown-menu')
                  .find('input')
                  .type(remoteRegistryName)
                  .then(() => {
                    cy.getByDataCy(`${remoteRegistryName}`).click();
                  });
              } else {
                cy.filterTableBySingleText(remoteRegistryName);
                cy.getByDataCy('checkbox-column-cell').find('input').click();
                cy.clickButton('Confirm');
              }
            });
          cy.getByDataCy('Submit').click();
          cy.url().should('contain', '/execution-environments/');
          cy.filterTableBySingleText(eeName);
          cy.get('tbody').find('tr').should('have.length', 1);
          cy.get('tbody').within(() => {
            cy.getByDataCy('container-repository-name-column-cell').should('contain', eeName);
            cy.get('[data-cy="actions-dropdown"]')
              .click()
              .then(() => {
                cy.get(`[data-cy="delete-environment"]`).click();
              });
          });
          cy.get('[data-ouia-component-id="Permanently delete execution environments"]').within(
            () => {
              cy.get('[data-ouia-component-id="confirm"]').click();
              cy.get('[data-ouia-component-id="submit"]').click();
              cy.clickButton('Close');
            }
          );
          cy.contains('h2', 'No results found').should('be.visible');
          cy.get('[class*="empty-state__content"]')
            .should('exist')
            .should(
              'contain',
              'No results match this filter criteria. Clear all filters and try again.'
            );
          cy.deleteRemoteRegistry(remoteRegistry.id);
        });
    });
  });
});

describe('Execution Environment Details tab', () => {
  const num = (~~(Math.random() * 1000000)).toString();
  const registry = `docker${num}`;
  const container = `remotepine${num}`;

  before(() => {
    cy.hubLogin();
  });

  before(() => {
    cy.galaxykit('registry create', registry, 'https://registry.hub.docker.com/');
    cy.galaxykit('container create', container, 'library/alpine', registry);
  });

  after(() => {
    cy.galaxykit('container delete', container);
    cy.galaxykit('registry delete', registry);
  });

  it('should render the execution environment details page', () => {
    // test navigating by sidebar menu
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.filterTableBySingleText(container);
    cy.get('a').contains(container).click();
    cy.verifyPageTitle(container);
    cy.contains('Unsigned');

    const tabs = ['Details', 'Activity', 'Images', 'Access'];
    tabs.forEach((tab) => {
      cy.contains(tab);
    });
    cy.get('[aria-selected="true"]').contains('Details');
  });

  it('should render details page tab with instructions and empty readme', () => {
    // test visiting by URL
    cy.visit(`/execution-environments/${container}/`);
    cy.verifyPageTitle(container);
    cy.get('[aria-selected="true"]').contains('Details');
    cy.contains('Instructions');
    cy.contains('Pull this image');

    // in dev env should be 'localhost:4102'
    const host = window.location.host;
    const instructions = `podman pull ${host}/${container}`;
    cy.get('[data-cy="clipboard-copy"] input').should('have.value', instructions);
    cy.get('[data-cy="clipboard-copy"] input').should('have.attr', 'readonly', 'readonly');
    cy.contains('No README');
    cy.contains('Add a README with instructions for using this container.');
    cy.get('[data-cy="add-readme"]').contains('Add');
  });

  it('should add readme with markdown editor', () => {
    cy.visit(`/execution-environments/${container}/`);
    cy.verifyPageTitle(container);
    cy.clickButton('Add');
    cy.contains('README');
    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Raw Markdown');
      cy.contains('Preview');
      cy.typeBy('[data-cy="raw-markdown"]', '# Heading 1');
      cy.contains('Preview').parent().get('h1').contains('Heading 1');
      cy.contains('Cancel');
      cy.intercept(
        'PUT',
        hubAPI`/v3/plugin/execution-environments/repositories/${container}/_content/readme/`
      ).as('updateReadme');
      cy.clickButton('Save');
      cy.wait('@updateReadme');
    });
    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
  });

  it('should change readme after editing', () => {
    cy.visit(`/execution-environments/${container}/`);
    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Heading 1');
      cy.clickButton('Edit');
      cy.typeBy('[data-cy="raw-markdown"]', '{enter}**bold text**');
      cy.contains('Preview').parent().get('strong').contains('bold text');
      cy.intercept(
        'PUT',
        hubAPI`/v3/plugin/execution-environments/repositories/${container}/_content/readme/`
      ).as('updateReadme');
      cy.clickButton('Save');
      cy.wait('@updateReadme');
    });
    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
    cy.get('[data-cy="readme"]').get('strong').contains('bold text');
  });

  it('should not change readme after cancel edit', () => {
    cy.visit(`/execution-environments/${container}/`);
    cy.get('[data-cy="readme"]').within(() => {
      cy.clickButton('Edit');
      cy.typeBy('[data-cy="raw-markdown"]', '{enter}this should not be saved.');
      cy.contains('Preview').parent().contains('this should not be saved.');
      cy.clickButton('Cancel');
    });
    cy.get('[data-cy="readme"]').contains('this should not be saved.').should('not.exist');
  });
});
