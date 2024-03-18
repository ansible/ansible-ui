import { ToolbarFilterType } from '../../../../framework';
import * as useOptions from '../../../common/crud/useOptions';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxHost } from '../../interfaces/AwxHost';
import { Hosts } from './Hosts';
import { InventoryHosts } from '../inventories/InventoryPage/InventoryHosts';

describe('Hosts.cy.ts', () => {
  const hosts = 'hosts';
  const inventory_hosts = 'inventory_hosts';
  const smart_inventory_hosts = 'smart_inventory_hosts';

  const types = [hosts, inventory_hosts];

  types.forEach((type) => {
    const typeDesc = ` (${type})`;
    const component = type === hosts ? <Hosts /> : <InventoryHosts />;
    const path = type === inventory_hosts ? '/inventories/:inventory_type/:id/hosts' : '/hosts';
    const initialEntries =
      type === inventory_hosts ? [`/inventories/inventory/1/hosts`] : [`/hosts`];
    const params = {
      path,
      initialEntries,
    };

    describe('Non-empty list' + typeDesc, () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: type === hosts ? '/api/v2/hosts/*' : '/api/v2/inventories/1/hosts/*',
          },
          {
            fixture: 'hosts.json',
          }
        ).as('hostsList');

        if (type !== hosts) {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/inventories/1/*',
            },
            {
              fixture: 'inventories.json',
            }
          );
        }
      });

      it('should render inventory list', () => {
        cy.mount(component, params);
        if (type === hosts) {
          cy.verifyPageTitle('Hosts');
        }
        cy.get('table').find('tr').should('have.length', 10);
      });

      it('should have filters for Name, Description, Created By and Modified By', () => {
        cy.mount(component, params);

        if (type === hosts) {
          cy.intercept('/api/v2/hosts/?description__icontains=Description*').as(
            'descriptionFilterRequest'
          );
        } else {
          cy.intercept('/api/v2/inventories/1/hosts/?description__icontains=Description*').as(
            'descriptionFilterRequest'
          );
        }

        if (type === hosts) {
          cy.verifyPageTitle('Hosts');
          cy.get('[data-cy="smart-inventory"]').should('have.attr', 'aria-disabled', 'true');
        }

        cy.openToolbarFilterTypeSelect().within(() => {
          cy.contains(/^Name$/).should('be.visible');
          cy.contains(/^Description$/).should('be.visible');
          cy.contains(/^Created by$/).should('be.visible');
          cy.contains(/^Modified by$/).should('be.visible');
          cy.contains('button', /^Description$/).click();
        });
        cy.filterTableByText('Description');
        cy.wait('@descriptionFilterRequest');

        if (type === hosts) {
          cy.get('[data-cy="smart-inventory"]').should('not.be.disabled');
        }
        cy.clickButton(/^Clear all filters$/);
      });

      it('disable "create host" toolbar action if the user does not have permissions', () => {
        cy.stub(useOptions, 'useOptions').callsFake(() => ({
          data: {
            actions: {},
          },
        }));
        cy.mount(component, params);
        cy.contains('button', /^Create host$/).as('createButton');
        cy.get('@createButton').should('have.attr', 'aria-disabled', 'true');
        cy.get('@createButton').click({ force: true });

        if (type === hosts) {
          cy.hasTooltip(
            /^You do not have permission to create a host. Please contact your system administrator if there is an issue with your access.$/
          );
        } else {
          cy.hasTooltip(
            /^You do not have permission to create a host. Please contact your organization administrator if there is an issue with your access.$/
          );
        }
      });

      it('disable delete row action if the user does not have permissions', () => {
        cy.mount(component, params);
        cy.fixture('hosts')
          .then((hosts: AwxItemsResponse<AwxHost>) => {
            for (let i = 0; i < hosts.results.length; i++) {
              hosts.results[i].summary_fields.user_capabilities.delete = false;
              hosts.results[i].name = 'test';
            }
            return hosts;
          })
          .then((hostsList) => {
            cy.intercept(
              {
                method: 'GET',
                url: type === hosts ? '/api/v2/hosts/*' : '/api/v2/inventories/1/hosts/*',
              },
              { body: hostsList }
            );
          })
          .then(() => {
            cy.mount(component, params);
          })
          .then(() => {
            cy.contains('tr', 'test').within(() => {
              cy.get('button.toggle-kebab').click();
              cy.get('.pf-v5-c-dropdown__menu-item')
                .contains(/^Delete host$/)
                .as('deleteButton');
            });
            cy.get('@deleteButton').should('have.attr', 'aria-disabled', 'true');
            cy.get('@deleteButton').click();
            cy.hasTooltip('This cannot be deleted due to insufficient permission');
          });
      });

      it('disable edit row action if the user does not have permissions', () => {
        cy.fixture('hosts')
          .then((hosts: AwxItemsResponse<AwxHost>) => {
            for (let i = 0; i < hosts.results.length; i++) {
              hosts.results[i].summary_fields.user_capabilities.edit = false;
              hosts.results[i].name = 'test';
            }
            return hosts;
          })
          .then((hostsList) => {
            cy.intercept(
              {
                method: 'GET',
                url: type === hosts ? '/api/v2/hosts/*' : '/api/v2/inventories/1/hosts/*',
              },
              { body: hostsList }
            );
          })
          .then(() => {
            cy.mount(component, params);
          })
          .then(() => {
            cy.contains('tr', 'test').within(() => {
              cy.get('button[aria-label="Edit host"]').as('editButton');
            });
            cy.get('@editButton').should('have.attr', 'aria-disabled', 'true');
            cy.get('@editButton').click();
            cy.get('@editButton').hasTooltip(
              'This cannot be edited due to insufficient permission'
            );
          });
      });
    });

    describe('Empty list' + typeDesc, () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: type === hosts ? '/api/v2/hosts/*' : '/api/v2/inventories/1/hosts/*',
          },
          {
            fixture: 'emptyList.json',
          }
        ).as('emptyList');
      });

      it('display Empty State and create button for user with permission to create hosts', () => {
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
        cy.mount(component, params);
        if (type === hosts) {
          cy.contains(/^There are currently no hosts added$/);
        } else {
          cy.contains(/^There are currently no hosts added to this inventory.$/);
        }
        cy.contains(/^Please create a host by using the button below.$/);
        cy.contains('button', /^Create host$/).should('be.visible');
        cy.contains('button', /^Create host$/).click();
      });

      it('display Empty state for user without permission to create ', () => {
        cy.stub(useOptions, 'useOptions').callsFake(() => ({
          data: {
            actions: {},
          },
        }));
        cy.mount(component, params);
        cy.contains(/^You do not have permission to create a host.$/);
        cy.contains(
          /^Please contact your organization administrator if there is an issue with your access.$/
        );
        cy.contains('button', /^Create host$/).should('not.exist');
      });
    });
  });
});
