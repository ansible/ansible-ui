import { AwxHost } from '../../interfaces/AwxHost';
import { GroupHosts } from './GroupHosts';

describe('GroupHosts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/groups/**/all_hosts/**',
        hostname: 'localhost',
      },
      {
        fixture: 'hosts.json',
      }
    );
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/inventories/**/ad_hoc_commands',
        hostname: 'localhost',
      },
      {
        fixture: 'ad_hoc_commands.json',
      }
    );
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '**/hosts**',
        hostname: 'localhost',
      },
      {
        fixture: 'host_options.json',
      }
    );
  });

  it('renders group hosts', () => {
    cy.mount(<GroupHosts />, {
      path: '/inventories/:inventory_type/:id/groups/:group_id/nested_hosts',
      initialEntries: ['/inventories/inventory/1/groups/176/nested_hosts'],
    });
    cy.fixture('hosts.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: AwxHost[]) => {
        const host = results[0];
        cy.contains(host.name);
      });
  });

  it('disassociate group host from toolbar menu', () => {
    cy.mount(<GroupHosts />);
    cy.fixture('hosts.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: AwxHost[]) => {
        const host = results[0];
        cy.clickTableRowKebabAction(host.name, 'disassociate-selected-host');
        cy.contains('Disassociate host from group?');
      });
  });
});
