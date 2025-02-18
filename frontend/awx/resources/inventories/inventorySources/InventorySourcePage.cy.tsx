/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { InventorySourcePage } from './InventorySourcePage';

describe('InventorySourcePage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: awxAPI`/inventory_sources/*` },
      { fixture: 'inventory_source.json' }
    );
    cy.intercept(
      { method: 'OPTIONS', url: awxAPI`/inventory_sources` },
      { fixture: 'inventory_source_options.json' }
    );
  });

  it('Component renders and displays inventory source page', () => {
    cy.mount(<InventorySourcePage />, {
      path: '/inventories/:id/sources/:source_id',
      initialEntries: ['/inventories/1/sources/1'],
    });
    cy.get('h1').should('have.text', 'Demo Inventory Source');
  });

  it('Launches a inventory update', () => {
    cy.intercept('POST', awxAPI`/inventory_sources/*/update/`, (req) => {
      return req.reply({ statusCode: 200, body: { id: 1000, type: 'job' } });
    }).as('inventorySourceUpdate');
    cy.mount(<InventorySourcePage />, {
      path: '/inventories/:id/sources/:source_id',
      initialEntries: ['/inventories/1/sources/1'],
    });
    cy.clickButton(/^Sync inventory source$/);
    cy.wait('@inventorySourceUpdate');
  });

  it('Handles HTTP errors properly', () => {
    cy.intercept('POST', awxAPI`/inventory_sources/*/update/`, (req) => {
      return req.reply({ statusCode: 400, body: { id: 1000, type: 'job' } });
    }).as('inventorySourceUpdate');
    cy.mount(<InventorySourcePage />, {
      path: '/inventories/:id/sources/:source_id',
      initialEntries: ['/inventories/1/sources/1'],
    });
    cy.clickButton(/^Sync inventory source$/);
    cy.get('.pf-v5-c-alert__title').contains('Failed to update inventory source');
  });
});
