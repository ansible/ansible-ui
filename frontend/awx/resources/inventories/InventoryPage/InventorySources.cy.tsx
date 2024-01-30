import { InventorySource } from '../../../interfaces/InventorySource';
import { InventorySources } from './InventorySources';

describe('InventorySources.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/inventories/**',
        hostname: 'localhost',
      },
      {
        fixture: 'inventory_sources.json',
      }
    );
  });

  it('deletes source from toolbar menu', () => {
    cy.mount(<InventorySources />);
    cy.fixture('inventory_sources.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: InventorySource[]) => {
        const source = results[0];
        cy.selectTableRow(source.name, false);
        cy.clickToolbarKebabAction('delete-selected-sources');
        cy.contains('Permanently delete source').should('be.visible');
      });
  });

  it('row action to delete source is disabled if the selected source is running', () => {
    cy.mount(<InventorySources />);
    cy.fixture('inventory_sources.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: InventorySource[]) => {
        const source = results[2]; // source with status "running"
        cy.contains('tr', source.name).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete inventory source$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });

  it('row action to delete source is disabled if the user does not have permissions', () => {
    cy.mount(<InventorySources />);
    cy.fixture('inventory_sources.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: InventorySource[]) => {
        const source = results[1]; // sources with summary_fields.user_capabilities.delete: false
        cy.contains('tr', source.name).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete inventory source$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });
});
