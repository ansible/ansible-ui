/* eslint-disable i18next/no-literal-string */
import { Inventory } from '../../../interfaces/Inventory';
import { InventoryDetails } from './InventoryDetails';

describe('InventoryDetails', () => {
  it('Component renders and displays inventory', () => {
    cy.fixture('inventory').then((inventory: Inventory) => {
      cy.mount(<InventoryDetails inventory={inventory} />);
      cy.get('#name').should('have.text', 'test inventory');
      cy.get('#type').should('have.text', 'Inventory');
      cy.get('#organization').should('have.text', 'Default');
      cy.contains('a', 'Default').should('have.attr', 'href', '/ui_next/organizations/details/1');
      cy.get('#total-hosts').should('have.text', '1');
      cy.get('#labels').should('have.text', 'test label');
      cy.get(
        '#created > .pf-c-description-list__text > [style="white-space: nowrap;"] > .pf-c-button'
      ).should('have.text', 'awx');
      cy.get(
        '#last-modified > .pf-c-description-list__text > [style="white-space: nowrap;"] > .pf-c-button'
      ).should('have.text', 'awx');
    });
  });
});
