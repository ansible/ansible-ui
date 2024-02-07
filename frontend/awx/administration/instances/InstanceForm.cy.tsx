import { AddInstance } from './InstanceForm';
import type { IInstanceInput } from './InstanceForm';

describe('Add instance Form', () => {
  it('should validate required fields on save', () => {
    cy.mount(<AddInstance />);
    cy.get('[data-cy="listener-port"]').type('0');
    cy.clickButton(/^Save$/);
    cy.contains('Host name is required.').should('be.visible');
    cy.contains('Ensure this value is greater than or equal to 1024.').should('be.visible');
  });

  it('should validate regex fields on save', () => {
    cy.mount(<AddInstance />);
    cy.intercept('POST', '/api/v2/instances/', {
      statusCode: 400,
      body: { hostname: ['whitespaces in hostnames are illegal'] },
    }).as('postInstance');
    cy.get('[data-cy="hostname"]').type('illegal hostname test');
    cy.clickButton(/^Save$/);
    cy.wait('@postInstance');
    cy.contains('whitespaces in hostnames are illegal').should('be.visible');
  });

  it('should add instance', () => {
    cy.mount(<AddInstance />);
    cy.intercept('POST', '/api/v2/instances/', {
      statusCode: 201,
      body: {
        node_type: 'execution',
        node_state: 'installed',
        hostname: 'AddInstanceMock',
        listener_port: null,
      },
    }).as('addInstance');
    cy.get('[data-cy="hostname"]').type('AddInstanceMock');
    cy.clickButton(/^Save$/);
    cy.wait('@addInstance')
      .its('request.body')
      .then((instance: IInstanceInput) => {
        expect(instance).to.deep.equal({
          node_type: 'execution',
          node_state: 'installed',
          hostname: 'AddInstanceMock',
          listener_port: null,
        });
      });
  });

  it('should add instance with complete form', () => {
    cy.intercept('POST', '/api/v2/instances/', {
      statusCode: 201,
      body: {
        node_type: 'hop',
        node_state: 'installed',
        hostname: 'AddInstanceMockWithPeers',
        description: 'mock instance description',
        listener_port: 9999,
        peers: ['e2eInstance0daD'],
        enabled: true,
        managed_by_policy: true,
        peers_from_control_nodes: true,
      },
    }).as('addInstanceWithPeers');
    cy.mount(<AddInstance />);
    cy.get('[data-cy="hostname"]').type('AddInstanceMockWithPeers');
    cy.get('[data-cy="description"]').type('mock instance description');
    cy.get('[data-cy="listener-port"]').type('9999');
    cy.selectDropdownOptionByResourceName('node-type', 'Hop');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/instances/?not__node_type=control&order_by=hostname&page=1&page_size=10',
      },
      {
        statusCode: 200,
        fixture: 'instance_with_peer.json',
      }
    );

    cy.get('[data-cy="peer-select-form-group"]').within(() => {
      cy.get('button').eq(1).click();
    });
    cy.get('[data-cy="checkbox-column-cell"]').click();
    cy.clickButton('Confirm');

    cy.get('[data-cy="enabled"]').click();
    cy.get('[data-cy="managed_by_policy"]').click();
    cy.get('[data-cy="peers_from_control_nodes"]').click();

    cy.clickButton(/^Save$/);
    cy.wait('@addInstanceWithPeers')
      .its('request.body')
      .then((instance: IInstanceInput) => {
        expect(instance).to.deep.equal({
          node_type: 'hop',
          node_state: 'installed',
          hostname: 'AddInstanceMockWithPeers',
          description: 'mock instance description',
          listener_port: 9999,
          peers: ['e2eInstance0daD'],
          enabled: true,
          managed_by_policy: true,
          peers_from_control_nodes: true,
        });
      });
  });
});
