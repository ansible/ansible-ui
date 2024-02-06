import { ExecutionEnvironments } from './constants';

describe('Execution Environments', () => {
  const num = (~~(Math.random() * 1000000)).toString();
  const registry = `docker${num}`;
  const container = `remotepine${num}`;

  before(() => {
    cy.hubLogin();

    cy.galaxykit('registry create', registry, 'https://registry.hub.docker.com/');

    cy.galaxykit('container create', container, 'library/alpine', registry);
  });

  after(() => {
    cy.galaxykit('registry delete', registry);

    cy.galaxykit('container delete', container);
  });

  it('it should render the execution environments page', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
  });

  it('should render the execution environment details page', () => {
    // test navigating by sidebar menu
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.filterTableByText(`remotepine${num}`);
    cy.get('a').contains(`remotepine${num}`).click();
    cy.verifyPageTitle(`remotepine${num}`);

    cy.contains('unsigned');

    const tabs = ['Details', 'Activity', 'Images', 'Access'];

    tabs.forEach((tab) => {
      cy.contains(tab);
    });
    cy.get('[aria-selected="true"]').contains('Details');
  });

  it('should render details page tab with instructions and empty readme', () => {
    // test visiting by URL
    cy.visit(`/execution-environments/${container}/`);
    cy.verifyPageTitle(`remotepine${num}`);
    cy.get('[aria-selected="true"]').contains('Details');

    cy.contains('Instructions');
    cy.contains('Pull this image');

    // in dev env should be 'localhost:4102'
    const host = window.location.host;
    const instructions = `podman pull ${host}/${container}`;
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
    cy.visit(`/execution-environments/${container}/`);
    cy.verifyPageTitle(`remotepine${num}`);
    cy.clickButton('Add');
    cy.contains('README');
    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Raw Markdown');
      cy.contains('Preview');

      cy.get('[data-cy="raw-markdown"]').type('# Heading 1');
      cy.contains('Preview').parent().get('h1').contains('Heading 1');

      cy.contains('Cancel');
      cy.clickButton('Save');
    });

    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
  });

  it('should change readme after editing', () => {
    cy.visit(`/execution-environments/${container}/`);

    cy.get('[data-cy="readme"]').within(() => {
      cy.contains('Heading 1');
      cy.clickButton('Edit');

      cy.get('[data-cy="raw-markdown"]').type('{enter}**bold text**');
      cy.contains('Preview').parent().get('strong').contains('bold text');
      cy.clickButton('Save');
    });

    cy.get('[data-cy="readme"]').get('h1').contains('Heading 1');
    cy.get('[data-cy="readme"]').get('strong').contains('bold text');
  });

  it('should not change readme after cancel edit', () => {
    cy.visit(`/execution-environments/${container}/`);

    cy.get('[data-cy="readme"]').within(() => {
      cy.clickButton('Edit');

      cy.get('[data-cy="raw-markdown"]').type('{enter}this should not be saved.');
      cy.contains('Preview').parent().contains('this should not be saved.');
      cy.clickButton('Cancel');
    });

    cy.get('[data-cy="readme"]').contains('this should not be saved.').should('not.exist');
  });
});
