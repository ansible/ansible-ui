import { CyHttpMessages } from 'cypress/types/net-stubbing';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Inventory } from '../../interfaces/Inventory';
import { Label } from '../../interfaces/Label';
import { Organization } from '../../interfaces/Organization';
import { CreateInventory, EditInventory, InventoryCreate } from './InventoryForm';

export type regularPayload = {
  kind: string;
  name: string;
  description: string;
  labels: Array<{ name: string }>;
  variables: string;
  prevent_instance_group_fallback: boolean;
  organization: number;
};

export type smartPayload = {
  kind: string;
  name: string;
  description: string;
  variables: string;
  organization: number;
  host_filter: string;
};

describe('Create Edit Inventory Form', () => {
  const regularPayload = {
    kind: '',
    name: 'test',
    description: 'test description',
    labels: [{ name: 'test label' }],
    variables: 'hello:world',
    prevent_instance_group_fallback: false,
    organization: 1,
  };

  const smartPayload = {
    kind: 'smart',
    name: 'smart test',
    description: 'smart test description',
    variables: 'hello:world',
    organization: 1,
    host_filter: 'name__icontains=local',
  };

  const kinds: ('' | 'smart' | 'constructed')[] = ['', 'smart'];

  describe('Create Inventory', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/instance_groups/*' },
        { fixture: 'instance_groups.json' }
      );
      cy.intercept({ method: 'GET', url: '/api/v2/labels/*' }, { fixture: 'labels.json' });
    });
    kinds.forEach((kind) => {
      const path = '/inventories/:inventory_type/create';

      const initialEntries =
        kind === '' ? [`/inventories/inventory/create`] : [`/inventories/smart_inventory/create`];

      const payload: regularPayload | smartPayload = kind === '' ? regularPayload : smartPayload;

      it(`Validate required fields on create (${kind === '' ? 'regular' : kind})`, () => {
        cy.mount(<CreateInventory inventoryKind={kind} />, {
          path,
          initialEntries,
        });
        cy.clickButton(/^Create inventory$/);
        cy.contains('Name is required.').should('be.visible');
        cy.contains('Organization is required.').should('be.visible');
        if (kind === 'smart') {
          cy.contains('Smart host filter is required.').should('be.visible');
        }
      });

      it(`Create inventory using correct field values (${kind === '' ? 'regular' : kind})`, () => {
        cy.intercept('POST', '/api/v2/inventories/', {
          statusCode: 201,
          fixture: 'inventory.json',
        }).as('createInventory');

        cy.intercept('POST', '/api/v2/inventories/*/instance_groups/', {
          statusCode: 204,
        }).as('submitInstanceGroup');

        if (kind === '') {
          cy.intercept('POST', '/api/v2/inventories/*/labels/', {
            statusCode: 204,
          }).as('submitLabels');
        }

        cy.mount(<CreateInventory inventoryKind={kind} />, {
          path,
          initialEntries,
        });

        cy.get('[data-cy="name"]').type(payload.name);
        cy.get('[data-cy="description"]').type(payload.description);
        cy.get('[data-cy="variables"]').type('hello:world');
        cy.fixture('organizations').then((orgResponse: AwxItemsResponse<Organization>) => {
          cy.selectSingleSelectOption('[data-cy="organization"]', orgResponse.results[0].name);
        });
        if (kind === 'smart' && 'host_filter' in payload) {
          cy.get('[data-cy="host-filter"]').type(payload.host_filter);
        }
        if (kind === '' && 'labels' in payload) {
          cy.get('[id^=pf-select-toggle-id-][id$=-select-multi-typeahead-typeahead]').type(
            payload.labels[0].name
          );
          cy.get('.pf-v5-c-select__menu-item').click();
        }
        cy.get('.pf-v5-c-input-group > .pf-v5-c-button').click();
        cy.fixture('instance_groups').then((ig_response: AwxItemsResponse<InstanceGroup>) =>
          cy.selectTableRowInDialog(ig_response.results[0].name)
        );
        cy.clickModalButton('Confirm');
        cy.clickButton(/^Create inventory$/);

        cy.wait('@createInventory')
          .its('request.body')
          .then((createdInventory) => {
            expect(createdInventory).to.deep.equal(payload);
            cy.wait('@submitInstanceGroup')
              .its('request.body')
              .then((createdInstanceGroup) => {
                expect(createdInstanceGroup).to.deep.equal({ id: 1 });
              });
          });
      });
    });
  });

  describe('Edit Inventory', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'PATCH', url: '/api/v2/inventories/*/' },
        { fixture: 'inventory.json' }
      ).as('EditInvReq');
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*/' },
        { fixture: 'organization.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/instance_groups/*' },
        { fixture: 'instance_groups.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/inventories/*/instance_groups/' },
        { fixture: 'instance_groups.json' }
      );
      cy.intercept({ method: 'GET', url: '/api/v2/labels/*' }, { fixture: 'labels.json' });

      cy.fixture('instance_groups')
        .then((ig_response: AwxItemsResponse<InstanceGroup>) => {
          ig_response.results = [ig_response.results[0]];
          cy.intercept(
            { method: 'GET', url: '/api/v2/inventories/*/instance_groups/' },
            { body: ig_response }
          );
        })
        .as('loadIG');
    });
    kinds.forEach((kind) => {
      const path = '/inventories/:inventory_type/:id/edit';

      const initialEntries =
        kind === '' ? [`/inventories/inventory/1/edit`] : [`/inventories/smart_inventory/2/edit`];

      const payload = kind === '' ? regularPayload : smartPayload;

      it(`Preload the form with correct values (${kind === '' ? 'regular' : kind})`, () => {
        cy.fixture('inventory')
          .then((inventory: Inventory) => {
            inventory.kind = payload.kind as '' | 'smart' | 'constructed';
            inventory.name = payload.name;
            inventory.description = payload.description;
            if (kind === '' && 'labels' in payload) {
              inventory.summary_fields.labels.results = payload.labels as Label[];
            }
            inventory.variables = payload.variables;
            if (kind === '' && 'prevent_instance_group_fallback' in payload) {
              inventory.prevent_instance_group_fallback = payload.prevent_instance_group_fallback;
            }
            inventory.organization = payload.organization;

            if (kind === 'smart' && 'host_filter' in payload) {
              inventory.host_filter = payload.host_filter;
            }
          })
          .then((inventory: Inventory) => {
            cy.intercept({ method: 'GET', url: '/api/v2/inventories/*/' }, { body: inventory });
          });
        cy.mount(<EditInventory />, {
          path,
          initialEntries,
        });
        cy.get('[data-cy="name"]').should('have.value', payload.name);
        cy.get('[data-cy="description"]').should('have.value', payload.description);
        cy.fixture('organization').then((organization: Organization) =>
          cy.get('[data-cy="organization"]').should('contain', organization.name)
        );
        if (kind === 'smart' && 'host_filter' in payload) {
          cy.get('[data-cy="host-filter"]').should('have.value', payload.host_filter);
        }
        cy.get('[data-cy="variables"]').should('have.text', payload.variables);
        cy.wait('@loadIG').then(() => {
          cy.get('[data-cy="instance-group-select-form-group"]').should('contain', 'controlplane');
        });
        if (kind === '' && 'labels' in payload) {
          cy.get('[data-cy="labels-form-group"]').should('contain', payload.labels[0].name);
        }
      });

      it(`Check correct request body is passed after editing inventory (${kind === '' ? 'regular' : kind})`, () => {
        cy.fixture('inventory')
          .then((inventory: Inventory) => {
            inventory.kind = payload.kind as '' | 'smart' | 'constructed';
            inventory.name = payload.name;
            inventory.description = payload.description;
            if (kind === '' && 'labels' in payload) {
              inventory.summary_fields.labels.results = payload.labels as Label[];
            }
            inventory.variables = payload.variables;
            if (kind === '' && 'prevent_instance_group_fallback' in payload) {
              inventory.prevent_instance_group_fallback = payload.prevent_instance_group_fallback;
            }
            inventory.organization = payload.organization;

            if (kind === 'smart' && 'host_filter' in payload) {
              inventory.host_filter = payload.host_filter;
            }
          })
          .then((inventory: Inventory) => {
            cy.intercept({ method: 'GET', url: '/api/v2/inventories/*/' }, { body: inventory });
          });
        cy.mount(<EditInventory />, {
          path,
          initialEntries,
        });
        cy.get('[data-cy="name"]').clear();
        cy.get('[data-cy="name"]').type('Edited name');
        cy.get('[data-cy="description"]').clear();
        cy.get('[data-cy="description"]').type('Edited description');
        cy.get('[data-cy="variables"]').type('s');
        cy.fixture('organizations').then((orgResponse: AwxItemsResponse<Organization>) => {
          cy.selectSingleSelectOption('[data-cy="organization"]', orgResponse.results[1].name);
        });
        if (kind === 'smart' && 'host_filter' in payload) {
          cy.get('[data-cy="host-filter"]').clear();
          cy.get('[data-cy="host-filter"]').type('name__icontains=edited-local');
        }
        if (kind === '') {
          cy.get('.pf-v5-c-select__toggle-clear').click();
          cy.get('[id^=pf-select-toggle-id-][id$=-select-multi-typeahead-typeahead]').type(
            'edited test'
          );
          cy.get('.pf-v5-c-select__menu-item').click();
        }
        cy.get('.pf-v5-c-input-group > .pf-v5-c-button').click();
        cy.fixture('instance_groups').then((ig_response: AwxItemsResponse<InstanceGroup>) =>
          cy.selectTableRowInDialog(ig_response.results[1].name)
        );
        cy.clickModalButton('Confirm');
        cy.clickButton(/^Save inventory$/);
        cy.wait('@EditInvReq')
          .its('request.body')
          .then((editedInventory: InventoryCreate) => {
            expect(editedInventory.name).to.equal('Edited name');
            expect(editedInventory.description).to.equal('Edited description');
            expect(editedInventory.variables).to.equal(`${payload.variables}s`);
            if (kind === 'smart' && 'host_filter' in payload) {
              expect(editedInventory.host_filter).to.equal('name__icontains=edited-local');
            }
            cy.fixture('organizations').then((orgResponse: AwxItemsResponse<Organization>) => {
              expect(editedInventory.organization).to.equal(orgResponse.results[1].id);
            });
          });

        cy.intercept(
          'POST',
          '/api/v2/inventories/*/instance_groups/',
          (req: CyHttpMessages.IncomingHttpRequest) => {
            const editedIG: { disassociate?: boolean; id: number } = req.body as {
              disassociate?: boolean;
              id: number;
            };
            if ('disassociate' in editedIG) {
              expect(editedIG.disassociate).to.equal(true);
              cy.fixture('instance_groups').then((igResponse: AwxItemsResponse<InstanceGroup>) => {
                expect(editedIG.id).to.equal(igResponse.results[0].id);
              });
            } else {
              cy.fixture('instance_groups').then((igResponse: AwxItemsResponse<InstanceGroup>) => {
                expect(editedIG.id).to.equal(igResponse.results[1].id);
              });
            }
          }
        );

        cy.intercept(
          { method: 'POST', url: '/api/v2/inventories/*/labels/' },
          (req: CyHttpMessages.IncomingHttpRequest) => {
            const editedLabel: { disassociate?: boolean; id?: number; name: string } = req.body as {
              disassociate?: boolean;
              id?: number;
              name: string;
            };
            if ('disassociate' in editedLabel) {
              expect(editedLabel.disassociate).to.equal(true);
              expect(editedLabel.id).to.equal(1);
            } else {
              expect(editedLabel.name).to.equal('edited test');
            }
          }
        );
      });

      it(`Validate required fields on save (${kind === '' ? 'regular' : kind})`, () => {
        cy.mount(<EditInventory />, {
          path,
          initialEntries,
        });
        cy.clickButton(/^Save inventory$/);
        cy.get('[data-cy="name"]').clear();
        cy.contains('Name is required.').should('be.visible');
        if (kind === 'smart') {
          cy.get('[data-cy="host-filter"]').clear();
          cy.contains('Smart host filter is required.').should('be.visible');
        }
      });
    });
  });
});
