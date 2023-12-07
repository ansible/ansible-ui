/* eslint-disable i18next/no-literal-string */

import { InventorySourceDetails } from './InventorySourceDetails';

describe('InventorySourceDetails', () => {
  before(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*' },
      { fixture: 'inventory_source.json' }
    );
    cy.intercept(
      { method: 'OPTIONS', url: '/api/v2/inventory_sources' },
      { fixture: 'inventory_source_options.json' }
    );
  });
  it('Component renders and displays project', () => {
    cy.mount(<InventorySourceDetails />, {
      path: '/inventories/:id/sources/:source_id/details',
      initialEntries: ['/inventories/1/sources/1/details'],
    });
    cy.get('#name').should('have.text', 'Demo Inventory Source');
    cy.get('#organization').should('have.text', 'Default');
    cy.get('#last-job-status').invoke('text').as('Failed');
    cy.get('#source').should('have.text', 'Sourced from a Project');
    cy.get('#project').should('have.text', 'Demo Project');
    cy.get('#inventory-file').should('have.text', '/ (project root)');
    cy.get('#verbosity').should('have.text', '1 (Verbose)');

    cy.get('#cache-timeout').should('have.text', '0 seconds');
    cy.get('#source-variables').should('have.text', '---');
    cy.get('#created > .pf-v5-c-description-list__text > .date-time > .pf-v5-c-button').should(
      'have.text',
      'dev'
    );
    cy.get(
      '#last-modified > .pf-v5-c-description-list__text > .date-time > .pf-v5-c-button'
    ).should('have.text', 'dev');
  });
});
