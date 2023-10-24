/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { InventorySourcePage } from './InventorySourcePage';

describe('InventorySourcePage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*' },
      { fixture: 'inventory_source.json' }
    );
    cy.intercept(
      { method: 'OPTIONS', url: '/api/v2/inventory_sources' },
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
    cy.intercept('POST', '/api/v2/inventory_sources/*/update/', (req) => {
      return req.reply({ statusCode: 200, body: { id: 1000, type: 'job' } });
    }).as('inventorySourceUpdate');
    cy.mount(<InventorySourcePage />, {
      path: '/inventories/:id/sources/:source_id',
      initialEntries: ['/inventories/1/sources/1'],
    });
    cy.clickButton(/^Launch inventory update$/);
    cy.wait('@inventorySourceUpdate');
  });

  it('Handles HTTP errors properly', () => {
    cy.intercept('POST', '/api/v2/inventory_sources/*/update/', (req) => {
      return req.reply({ statusCode: 400, body: { id: 1000, type: 'job' } });
    }).as('inventorySourceUpdate');
    cy.mount(<InventorySourcePage />, {
      path: '/inventories/:id/sources/:source_id',
      initialEntries: ['/inventories/1/sources/1'],
    });

    cy.clickButton(/^Launch inventory update$/);

    cy.get('.pf-v5-c-alert__title').contains('Failed to update inventory source');
  });
});
describe('InventorySourcePage RBAC', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*' },
      { fixture: 'inventory_source.json' }
    );
    cy.intercept(
      { method: 'OPTIONS', url: '/api/v2/inventory_sources' },
      { fixture: 'inventory_source_options.json' }
    );
  });
  it('Disables the launch buttons for sys auditors', () => {
    cy.mount(
      <InventorySourcePage />,
      {
        path: '/inventories/:inventory_type/:id/sources/:source_id',
        initialEntries: ['/inventories/inventory/1/sources/1/'],
      },
      'activeUserSysAuditor.json'
    );
    cy.get('button#launch-inventory-update').should('have.attr', 'aria-disabled', 'true');
    cy.get('button#edit-inventory-source').should('have.attr', 'aria-disabled', 'true');
  });
});
