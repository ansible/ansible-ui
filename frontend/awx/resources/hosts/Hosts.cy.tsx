import { ToolbarFilterType } from '../../../../framework';
import * as useOptions from '../../../common/crud/useOptions';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxHost } from '../../interfaces/AwxHost';
import { Hosts } from './Hosts';
import { InventoryHosts } from '../inventories/InventoryPage/InventoryHosts';

const hosts = 'hosts';
const inventory_hosts = 'inventory_hosts';
const smart_inventory_hosts = 'smart_inventory_hosts';
const constructed_inventory_hosts = 'constructed_inventory_hosts';

describe('Hosts.cy.ts', () => {
  

  const types = [hosts, inventory_hosts, smart_inventory_hosts, constructed_inventory_hosts];

  types.forEach((type) => {
    const typeDesc = ` (${type})`;
    const component = type === hosts ? <Hosts /> : <InventoryHosts />;
    const path = type === hosts ? '/hosts' : '/inventories/:inventory_type/:id/hosts';

    let inventory_type = '';

    const dynamic =
      type === smart_inventory_hosts || type === constructed_inventory_hosts ? true : false;

    switch (type) {
      case inventory_hosts:
        inventory_type = 'inventory';
        break;
      case smart_inventory_hosts:
        inventory_type = 'smart_inventory';
        break;
      case constructed_inventory_hosts:
        inventory_type = 'constructed_inventory';
        break;
    }

    const initialEntries = type === hosts ? [`/hosts`] : [`/inventories/${inventory_type}/1/hosts`];
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

      if (!dynamic) {
        it('should render inventory list', () => {
          cy.mount(component, params);
          if (type === hosts) {
            cy.verifyPageTitle('Hosts');
          }
          cy.get('table').find('tr').should('have.length', 10);
        });
      }

      if (dynamic) {
        it('smart or constructed inventory does not have any actions beside run command', () => {
          cy.mount(component, params);
          cy.get(`[data-cy='edit-host]`).should('not.exist');
          cy.get(`[data-cy='create-host]`).should('not.exist');
          cy.get(`[data-cy='run-command']`);
          cy.get(`[data-cy='actions-dropdown']`).should('not.exist');
        });
      }

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

          if (!dynamic) {
            cy.contains(/^Description$/).should('be.visible');
          }

          cy.contains(/^Created by$/).should('be.visible');

          cy.contains(/^Modified by$/).should('be.visible');

          if (!dynamic) {
            cy.contains('button', /^Description$/).click();
          }
        });
        cy.filterTableByText('Description');
        if (!dynamic) {
          cy.wait('@descriptionFilterRequest');
        }
        if (type === hosts) {
          cy.get('[data-cy="smart-inventory"]').should('not.be.disabled');
        }
        cy.clickButton(/^Clear all filters$/);
      });

      if (!dynamic) {
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
         disableDeleteRowAction(component, params, type);
        });

        it('disable edit row action if the user does not have permissions', () => {
         disableEditRowAction(component, params, type);
        });
      }
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

      if (!dynamic) {
        it('display Empty State and create button for user with permission to create hosts', () => {
          testCreatePermissions(component, params, type);
        });

        it('display Empty state for user without permission to create ', () => {
          cy.stub(useOptions, 'useOptions').callsFake(() => ({
            data: {
              actions: {},
            },
          }));
          testCreatePermissionsForbidden(component, params, dynamic);
        });

      } else {
        it('display Empty state for smart inventory', () => {
          testCreatePermissionsForbidden(component, params, dynamic);
        });
      }

     
    });
  });
});

type paramsType = { path: string; initialEntries: string[]; } | undefined;

function testCreatePermissionsForbidden(component : React.ReactElement, params : paramsType, dynamic : boolean) {
  cy.mount(component, params);

  if (!dynamic) {
    cy.contains(/^You do not have permission to create a host.$/);
    cy.contains(
      /^Please contact your organization administrator if there is an issue with your access.$/
    );
  } else {
    cy.contains(/^No Hosts Found$/);
    cy.contains(/^Please add Hosts to populate this list$/);
  }
  cy.contains('button', /^Create host$/).should('not.exist');
}

function testCreatePermissions(component : React.ReactElement, params : paramsType, type : string) 
{
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
}

function disableEditRowAction(component : React.ReactElement, params : paramsType, type : string)
{
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
}

function disableDeleteRowAction(component : React.ReactElement, params : paramsType, type : string)
{
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
      cy.get(`tr [data-cy="actions-dropdown"]`).click();
      cy.get(`[data-cy="delete-host"]`).as('deleteButton');
      cy.get('@deleteButton').should('have.attr', 'aria-disabled', 'true');
      cy.get('@deleteButton').click();
      cy.hasTooltip('This cannot be deleted due to insufficient permission');
    });
}