import { ToolbarFilterType } from '../../../../framework';
import * as useOptions from '../../../common/crud/useOptions';
import { Inventory } from '../../interfaces/Inventory';
import { Inventories } from './Inventories';

describe('Inventories', () => {
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

    //Missing test cases that need to be written:
    it.skip('can show 404 status if user tries to view an inventory that doesn’t exist', () => {});
    it.skip('can sort the list of inventories', () => {});
    it.skip('can paginate through the list of inventories', () => {});
    it.skip('can view variables in YAML and JSON format ', () => {});
    it.skip('can verify that an inventory job templates tab will only show its associated job templates', () => {});
    it.skip('can verify that an inventory jobs tab will only show its associated jobs', () => {});

    it('should render inventory list', () => {
      cy.mount(<Inventories />);
      cy.verifyPageTitle('Inventories');
      cy.get('table').find('tr').should('have.length', 10);
    });

    it('should have filters for Name, Description, Created By and Modified By', () => {
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/inventories/' },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<Inventories />);
      cy.verifyPageTitle('Inventories');
      cy.openToolbarFilterTypeSelect().within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^Description$/).should('be.visible');
        cy.contains(/^Created by$/).should('be.visible');
        cy.contains(/^Modified by$/).should('be.visible');
        cy.contains('button', /^Name$/).click();
      });
      cy.filterTableBySingleSelect('name', 'Demo Inventory');
      cy.get('tr').should('have.length.greaterThan', 0);
      cy.getByDataCy('filter-input').click();
      cy.clickButton(/^Clear all filters$/);
    });

    it('disable "create inventory" toolbar action if the user does not have permissions', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<Inventories />);
      cy.contains('button', /^Create inventory$/).as('createButton');
      cy.get('@createButton').should('have.attr', 'disabled');
      cy.get('@createButton').click({ force: true });
      cy.hasTooltip(
        /^You do not have permission to create an inventory. Please contact your organization administrator if there is an issue with your access.$/
      );
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
            cy.get('.pf-v5-c-dropdown__menu-item')
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
            cy.get('button[aria-label="Edit inventory"]').as('editButton');
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
            cy.get('.pf-v5-c-dropdown__menu-item')
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

    it('disable copy row action if the inventory has inventory sources', () => {
      cy.mount(<Inventories />);
      cy.fixture('inventories.json')
        .its('results')
        .should('be.an', 'array')
        .then((results: Inventory[]) => {
          const inventory = results.find((i) => i.id === 1);
          cy.contains('tr', (inventory as Inventory).name).within(() => {
            cy.get('button.toggle-kebab').click();
            cy.get('.pf-v5-c-dropdown__menu-item')
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
                type: ToolbarFilterType.MultiText,
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
      cy.get('.pf-v5-c-dropdown__menu-item')
        .contains(/^Create inventory$/)
        .should('exist');
      cy.get('.pf-v5-c-dropdown__menu-item')
        .contains(/^Create smart inventory$/)
        .should('exist');
      cy.get('.pf-v5-c-dropdown__menu-item')
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
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create inventory$/).should('not.exist');
    });
  });
});
