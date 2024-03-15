import { AwxHost } from '../../../interfaces/AwxHost';
import type { IHostInput } from './InventoryHostForm';
import { CreateHost, EditHost } from './InventoryHostForm';

describe('Create Edit Inventory Host Form', () => {
  const payload = {
    name: 'test',
    variables: 'hello: world',
    description: 'mock host description',
    inventory: 1,
  };
  describe('Create Host', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/',
        },
        {
          fixture: 'inventory.json',
        }
      );
    });
    it('Validate required fields on create', () => {
      cy.mount(<CreateHost />);
      cy.clickButton(/^Create host$/);
      cy.contains('Name is required.').should('be.visible');
    });

    it('Create host using correct field values', () => {
      cy.intercept('POST', '/api/v2/hosts/', {
        statusCode: 201,
        body: payload,
      }).as('createHost');
      cy.mount(<CreateHost />);
      cy.get('[data-cy="name"]').type(payload.name);
      cy.get('[data-cy="description"]').type(payload.description);
      cy.get('[data-cy="variables"]').type('hello: world');
      cy.clickButton(/^Create host$/);
      cy.wait('@createHost')
        .its('request.body')
        .then((createdHost: IHostInput) => {
          expect(createdHost).to.deep.equal({
            name: payload.name,
            description: payload.description,
            variables: payload.variables,
            inventory: payload.inventory,
          });
        });
    });
  });

  describe('Edit Host', () => {
    beforeEach(() => {
      cy.fixture('awxHost')
        .then((host: AwxHost) => {
          host.name = payload.name;
          host.variables = payload.variables;
          host.description = payload.description;

          return host;
        })
        .then((host) => {
          cy.intercept({ method: 'GET', url: '/api/v2/hosts/*/' }, { body: host }).as('getHost');
          cy.intercept('PATCH', '/api/v2/hosts/*', { statusCode: 201, body: host }).as('editHost');
        });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/',
        },
        {
          fixture: 'inventory.json',
        }
      );
    });

    const types = ['inventory host'];

    types.forEach( (type) => {

      const path = type === 'inventory host' ?
        '/inventories/inventory/:id/host/:host_id/edit' :
        '/hosts/:id/edit';

      const initialEntries = type === 'inventory host' ?
        [`/inventories/inventory/1/host/435/edit`] :
        [`/hosts/435/edit`];

      it(`Preload the form with correct values (${type})`, () => {
        cy.mount(<EditHost />, {
          path,
          initialEntries,
        });
        cy.get('[data-cy="name"]').should('have.value', payload.name);
        cy.get('[data-cy="description"]').should('have.value', payload.description);
        cy.get('.mtk22').should('contain.text', 'hello');
        cy.get('.mtk5').should('contain.text', 'world');
      });

      it(`Check correct request body is passed after editing host (${type})`, () => {
        cy.mount(<EditHost />, {
          path,
          initialEntries,
        });
        cy.get('[data-cy="name"]').clear();
        cy.get('[data-cy="name"]').type('Edited Host');
        cy.get('[data-cy="description"]').clear();
        cy.get('[data-cy="description"]').type('Edited Description');
        cy.getBy('[data-cy="variables"]').type('s');
        cy.clickButton(/^Save host$/);
        cy.wait('@editHost')
          .its('request.body')
          .then((editedHost: IHostInput) => {
            expect(editedHost.name).to.equal('Edited Host');
            expect(editedHost.description).to.equal('Edited Description');
            expect(editedHost.variables).to.equal(`${payload.variables}s`);
          });
      });

      it(`Validate required fields on save (${type})`, () => {
        cy.mount(<EditHost />, {
          path,
          initialEntries,
        });
        cy.get('[data-cy="name"]').should('have.value', payload.name);
        cy.get('[data-cy="name"]').clear();
        cy.clickButton(/^Save host$/);
        cy.get('.pf-v5-c-helper-text__item-text').contains('Name is required');
      });
    });
  });
});
