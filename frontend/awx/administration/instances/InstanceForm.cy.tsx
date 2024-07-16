import { Instance } from '../../interfaces/Instance';
import { AddInstance, EditInstance } from './InstanceForm';

describe('Add instance Form', () => {
  it('should validate required fields on save', () => {
    cy.mount(<AddInstance />);
    cy.get('[data-cy="listener-port"]').type('0');
    cy.clickButton(/^Save instance group$/);
    cy.contains('Host name is required.').should('be.visible');
  });

  it('should validate regex fields on save', () => {
    cy.mount(<AddInstance />);
    cy.intercept('POST', '/api/v2/instances/', {
      statusCode: 400,
      body: { hostname: ['whitespaces in hostnames are illegal'] },
    }).as('postInstance');
    cy.get('[data-cy="hostname"]').type('illegal hostname test');
    cy.clickButton(/^Save instance group$/);
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
    cy.clickButton(/^Save instance group$/);
    cy.wait('@addInstance')
      .its('request.body')
      .then((instance: Instance) => {
        expect(instance).to.deep.equal({
          node_type: 'execution',
          node_state: 'installed',
          hostname: 'AddInstanceMock',
          enabled: true,
          peers_from_control_nodes: false,
          managed_by_policy: true,
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
        listener_port: 9999,
        peers: ['e2eInstance0daD'],
        enabled: true,
        managed_by_policy: true,
        peers_from_control_nodes: true,
      },
    }).as('addInstanceWithPeers');
    cy.mount(<AddInstance />);
    cy.get('[data-cy="hostname"]').type('AddInstanceMockWithPeers');
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

    cy.get('[data-cy="managed_by_policy"]').click();
    cy.get('[data-cy="peers_from_control_nodes"]').click();

    cy.clickButton(/^Save instance group$/);
    cy.wait('@addInstanceWithPeers')
      .its('request.body')
      .then((instance: Instance) => {
        expect(instance).to.deep.equal({
          enabled: true,
          hostname: 'AddInstanceMockWithPeers',
          listener_port: 9999,
          managed_by_policy: false,
          node_state: 'installed',
          node_type: 'hop',
          peers_from_control_nodes: true,
        });
      });
  });
});

describe('Edit instance Form', () => {
  it('Edit instance form should render', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/instances/*' }, { fixture: 'instance.json' }).as(
      'getInstance'
    );
    cy.mount(<EditInstance />);
    cy.verifyPageTitle('Edit receptor-1');
    cy.get('[data-cy="hostname"]').should('be.visible').should('be.disabled');
    cy.get('[data-cy="node-state"]').should('be.visible').should('be.disabled');
    cy.get('[data-cy="listener-port"]').should('be.visible').should('not.be.disabled');
    cy.get('[data-cy="node-type-form-group"]')
      .should('be.visible')
      .within(() => {
        cy.get('button').should('be.visible').should('be.disabled');
      });
    cy.get('[data-cy="enabled"]').should('be.visible').should('not.be.disabled');
    cy.get('[data-cy="managed_by_policy"]').should('be.visible').should('not.be.disabled');
    cy.get('[data-cy="peers_from_control_nodes"]').should('be.visible').should('not.be.disabled');

    cy.get('[data-cy="Submit"]').should('be.visible').should('not.be.disabled');
    cy.get('[data-cy="Cancel"]').should('be.visible').should('not.be.disabled');
  });
});
