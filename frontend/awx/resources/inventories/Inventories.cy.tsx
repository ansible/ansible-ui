import * as useOptions from '../../../common/crud/useOptions';
import { Inventories } from './Inventories';
import { Inventory } from '../../interfaces/Inventory';

describe('Inventories.cy.ts', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*',
        },
        {
          fixture: 'inventories.json',
        }
      ).as('inventoriesList');
    });
    it('should render inventory list', () => {
      cy.mount(<Inventories />);
      cy.hasTitle(/^Inventories$/);
      cy.get('table').find('tr').should('have.length', 10);
    });
    it('should have filters for Name, Description, Type, Organization, Created By and Modified By', () => {
      cy.mount(<Inventories />);
      cy.intercept('/api/v2/inventories/?organization__name__icontains=Organization%200*').as(
        'orgFilterRequest'
      );
      cy.hasTitle(/^Inventories$/);
      cy.contains('button.pf-c-select__toggle', /^Name$/).click();
      cy.get('ul.pf-c-select__menu').within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^Description$/).should('be.visible');
        cy.contains(/^Inventory Type$/).should('be.visible');
        cy.contains(/^Organization$/).should('be.visible');
        cy.contains(/^Created by$/).should('be.visible');
        cy.contains(/^Modified by$/).should('be.visible');
        cy.contains('button', /^Organization$/).click();
      });
      cy.filterByText('Organization 0');
      cy.wait('@orgFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('disable delete row action if the user does not have permissions', () => {
      cy.mount(<Inventories />);
      cy.fixture('inventories.json')
        .its('results')
        .should('be.an', 'array')
        .then((results: Inventory[]) => {
          const inventory = results.find((i) => i.id === 7);

          cy.contains('tr', (inventory as Inventory).name).within(() => {
            cy.get('button.toggle-kebab').click();
            cy.get('a[data-ouia-component-type="PF4/DropdownItem"]')
              .contains(/^Delete inventory$/)
              .as('deleteButton');
          });
          cy.get('@deleteButton').should('have.attr', 'aria-disabled', 'true');
          cy.get('@deleteButton').click();
          cy.hasTooltip('The inventory cannot be deleted due to insufficient permission');
        });
    });
    it('disable edit row action if the user does not have permissions', () => {
      cy.mount(<Inventories />);
      cy.fixture('inventories.json')
        .its('results')
        .should('be.an', 'array')
        .then((results: Inventory[]) => {
          const inventory = results.find((i) => i.id === 7);

          cy.contains('tr', (inventory as Inventory).name).within(() => {
            cy.get('button.toggle-kebab').click();
            cy.get('a[data-ouia-component-type="PF4/DropdownItem"]')
              .contains(/^Edit inventory$/)
              .as('editButton');
          });
          cy.get('@editButton').should('have.attr', 'aria-disabled', 'true');
          cy.get('@editButton').click();
          cy.get('@editButton').hasTooltip(
            'The inventory cannot be edited due to insufficient permission'
          );
        });
    });
    it('disable copy row action if the user does not have permissions', () => {
      cy.mount(<Inventories />);
      cy.fixture('inventories.json')
        .its('results')
        .should('be.an', 'array')
        .then((results: Inventory[]) => {
          const inventory = results.find((i) => i.id === 7);

          cy.contains('tr', (inventory as Inventory).name).within(() => {
            cy.get('button.toggle-kebab').click();
            cy.get('a[data-ouia-component-type="PF4/DropdownItem"]')
              .contains(/^Copy inventory$/)
              .as('copyButton');
          });
          cy.get('@copyButton').should('have.attr', 'aria-disabled', 'true');
          cy.get('@copyButton').click();
          cy.get('@copyButton').hasTooltip(
            'The inventory cannot be copied due to insufficient permission'
          );
        });
    });
    it('disavle copy row action if the inventory has inventory sources', () => {
      cy.mount(<Inventories />);
      cy.fixture('inventories.json')
        .its('results')
        .should('be.an', 'array')
        .then((results: Inventory[]) => {
          const inventory = results.find((i) => i.id === 1);
          cy.contains('tr', (inventory as Inventory).name).within(() => {
            cy.get('button.toggle-kebab').click();
            cy.get('a[data-ouia-component-type="PF4/DropdownItem"]')
              .contains(/^Copy inventory$/)
              .as('copyButton');
          });
          cy.get('@copyButton').should('have.attr', 'aria-disabled', 'true');
          cy.get('@copyButton').click();
          cy.get('@copyButton').hasTooltip('Inventories with sources cannot be copied');
        });
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('display Empty State and create button for user with permission to create inventories', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this team.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<Inventories />);
      cy.contains(/^There are currently no inventories added.$/);
      cy.contains(/^Please create an inventory by using the button below.$/);
      cy.contains('button', /^Create inventory$/).should('be.visible');
      cy.contains('button', /^Create inventory$/).click();
      cy.get('.pf-c-dropdown__menu-item')
        .contains(/^Create inventory$/)
        .should('exist');
      cy.get('.pf-c-dropdown__menu-item')
        .contains(/^Create smart inventory$/)
        .should('exist');
      cy.get('.pf-c-dropdown__menu-item')
        .contains(/^Create constructed inventory$/)
        .should('exist');
    });
    it('display Empty state for user without permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<Inventories />);
      cy.contains(/^You do not have permission to create an inventory.$/);
      cy.contains(
        /^Please contact your Organization Administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create inventory$/).should('not.exist');
    });
  });
});
