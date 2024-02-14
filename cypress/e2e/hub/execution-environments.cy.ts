import { randomString } from '../../../framework/utils/random-string';
import { RemoteRegistry } from '../../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { ExecutionEnvironment } from '../../../frontend/hub/execution-environments/ExecutionEnvironment';
import { hubAPI } from '../../support/formatApiPathForHub';
import { ExecutionEnvironments } from './constants';

describe('Execution Environments', () => {
  const id = randomString(4, 36).toLowerCase();
  const executionEnvironmentName = `e2e-registry-${id}`;
  const registryName = `e2e-ee-${id}`;
  let registry: RemoteRegistry;
  let executionEnvironment: ExecutionEnvironment;

  before(() => {
    cy.hubLogin();
    cy.requestPost<RemoteRegistry>(hubAPI`/_ui/v1/execution-environments/registries/`, {
      name: registryName,
      url: 'https://registry.hub.docker.com/',
    }).then((response) => {
      registry = response;
      cy.requestPost<
        ExecutionEnvironment,
        { name: string; registry: string; upstream_name: string }
      >(hubAPI`/_ui/v1/execution-environments/remotes/`, {
        name: executionEnvironmentName,
        registry: registry.id,
        upstream_name: 'upstream',
      }).then((response) => {
        cy.log('Execution environment created', response);
        executionEnvironment = response;
      });
    });
  });

  after(() => {
    cy.requestDelete(hubAPI`/_ui/v1/execution-environments/remotes/${executionEnvironment.id}/`, {
      failOnStatusCode: false,
    });
    cy.requestDelete(hubAPI`/_ui/v1/execution-environments/registries/${registry.id}/`, {
      failOnStatusCode: false,
    });
  });

  it('it should render the execution environments page', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
  });

  it('should render the execution environment details page', () => {
    // test navigating by sidebar menu
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.filterTableBySingleText(executionEnvironmentName);
    cy.get('a').contains(executionEnvironmentName).click();
    cy.verifyPageTitle(executionEnvironmentName);

    cy.contains('Unsigned');

    const tabs = ['Details', 'Activity', 'Images', 'Access'];

    tabs.forEach((tab) => {
      cy.contains(tab);
    });
    cy.get('[aria-selected="true"]').contains('Details');
  });

  it('should render details page tab with instructions and empty readme', () => {
    // test visiting by URL
    cy.visit(`/execution-environments/${executionEnvironmentName}/`);
    cy.verifyPageTitle(executionEnvironmentName);
    cy.get('[aria-selected="true"]').contains('Details');

    cy.contains('Instructions');
    cy.contains('Pull this image');

    // in dev env should be 'localhost:4102'
    const host = window.location.host;
    const instructions = `podman pull ${host}/${executionEnvironmentName}`;
    cy.get('[data-cy="clipboard-copy"] input').should('have.value', instructions);
    cy.get('[data-cy="clipboard-copy"] input').should('have.attr', 'readonly', 'readonly');

    cy.window().then((win) => {
      void win.navigator.clipboard.readText().then((text) => {
        expect(text).to.eq(instructions);
      });
    });

    cy.contains('No README');
    cy.contains('Add a README with instructions for using this container.');
    cy.get('[data-cy="add-readme"]').contains('Add');
  });

  it('should add readme with markdown editor', () => {
    cy.visit(`/execution-environments/${executionEnvironmentName}/`);
    cy.verifyPageTitle(executionEnvironmentName);
    cy.clickButton('Add');
    cy.contains('README');
    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Raw Markdown');
      cy.contains('Preview');
      cy.typeBy('[data-cy="raw-markdown"]', '# Heading 1');
      cy.contains('Preview').parent().get('h1').contains('Heading 1');
      cy.contains('Cancel');
      cy.clickButton('Save');
    });

    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
  });

  it('should change readme after editing', () => {
    cy.visit(`/execution-environments/${executionEnvironmentName}/`);

    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Heading 1');
      cy.clickButton('Edit');
      cy.typeBy('[data-cy="raw-markdown"]', '{enter}**bold text**');
      cy.contains('Preview').parent().get('strong').contains('bold text');
      cy.clickButton('Save');
    });

    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
    cy.get('[data-cy="readme"]').get('strong').contains('bold text');
  });

  it('should not change readme after cancel edit', () => {
    cy.visit(`/execution-environments/${executionEnvironmentName}/`);

    cy.get('[data-cy="readme"]').within(() => {
      cy.clickButton('Edit');
      cy.typeBy('[data-cy="raw-markdown"]', '{enter}this should not be saved.');
      cy.contains('Preview').parent().contains('this should not be saved.');
      cy.clickButton('Cancel');
    });

    cy.get('[data-cy="readme"]').contains('this should not be saved.').should('not.exist');
  });
});
