/* eslint-disable i18next/no-literal-string */
import { Inventory } from '../../../interfaces/Inventory';
import { InventoryDetailsInner as InventoryDetails } from './InventoryDetails';

describe('InventoryDetails', () => {
  const kinds: Array<'' | 'smart' | 'constructed'> = ['', 'smart', 'constructed'];

  kinds.forEach((kind) => {
    it(`Component renders and displays inventory (${kind === '' ? 'regular' : kind})`, () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/instance_groups*',
        },
        {
          fixture: 'instance_groups.json',
        }
      );
      cy.fixture('inventory')
        .then((inventory: Inventory) => {
          inventory.kind = kind;

          if (inventory.kind === 'smart') {
            inventory.host_filter = 'name__icontains=test';
          }
          if (inventory.kind === 'constructed') {
            inventory.hosts_with_active_failures = 1;
          }
        })
        .then((inventory: Inventory) => {
          cy.mount(<InventoryDetails inventory={inventory} />);
          cy.get('[data-cy="name"]').should('have.text', 'test inventory');
          cy.get('[data-cy="organization"]').should('have.text', 'Default');
          cy.get('[data-cy="total-hosts"]').should('have.text', '1');
          cy.get('[data-cy="labels"]').should('have.text', 'test label');
          cy.get('[data-cy="last-modified"]').should('contain.text', 'awx');
          cy.get('[data-cy="created"]').should('contain.text', 'awx');
          cy.get('[data-cy="instance-groups"]').should('contain.text', 'controlplane');
          cy.get('[data-cy="instance-groups"]').should('contain.text', 'default');
          cy.get('[data-cy="instance-groups"]').should('contain.text', 'Container Group 01');
          if (inventory.kind === '') {
            cy.get('[data-cy="type"]').should('have.text', 'Inventory');
            cy.get('body').should('not.have.descendants', '[data-cy="hosts-with-active-failures"]');
            cy.get('body').should('not.have.descendants', '[data-cy="total-groups"]');
            cy.get('body').should('not.have.descendants', '[data-cy="total-inventory-sources"]');
            cy.get('body').should(
              'not.have.descendants',
              '[data-cy="inventory-sources-with-active-failures"]'
            );
          }
          if (inventory.kind === 'smart') {
            cy.get('[data-cy="type"]').should('have.text', 'Smart inventory');
            cy.get('body').should('not.have.descendants', '[data-cy="hosts-with-active-failures"]');
            cy.get('body').should('not.have.descendants', '[data-cy="total-groups"]');
            cy.get('body').should('not.have.descendants', '[data-cy="total-inventory-sources"]');
            cy.get('body').should(
              'not.have.descendants',
              '[data-cy="inventory-sources-with-active-failures"]'
            );
          }
          if (inventory.kind === 'constructed') {
            cy.get('[data-cy="type"]').should('have.text', 'Constructed inventory');
            cy.get('body').should('have.descendants', '[data-cy="hosts-with-active-failures"]');
            cy.get('[data-cy="hosts-with-active-failures"]').should('have.text', 1);
            cy.get('body').should('have.descendants', '[data-cy="total-groups"]');
            cy.get('[data-cy="total-groups"]').should('have.text', 0);
            cy.get('body').should('have.descendants', '[data-cy="total-inventory-sources"]');
            cy.get('[data-cy="total-inventory-sources"]').should('have.text', 0);
            cy.get('body').should(
              'have.descendants',
              '[data-cy="inventory-sources-with-active-failures"]'
            );
            cy.get('[data-cy="inventory-sources-with-active-failures"]').should('have.text', 0);
            cy.get('body').should('have.descendants', '[data-cy="update-cache-timeout"]');
            cy.get('[data-cy="update-cache-timeout"]').should('have.text', 0);
            cy.get('body').should('have.descendants', '[data-cy="verbosity"]');
            cy.get('[data-cy="verbosity"]').should('have.text', `0 (Normal)`);
          }
        });
    });
  });
});
