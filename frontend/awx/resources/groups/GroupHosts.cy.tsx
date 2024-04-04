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

  const kinds = ['', 'constructed'];

  kinds.forEach((kind) => {
    const path = '/inventories/:inventory_type/:id/groups/:group_id/nested_hosts';
    const initialEntries =
      kind === ''
        ? ['/inventories/inventory/1/groups/176/nested_hosts']
        : ['/inventories/constructed_inventory/1/groups/176/nested_hosts'];

    it(`renders group hosts (${kind === '' ? 'inventory' : kind})`, () => {
      cy.mount(<GroupHosts />, {
        path,
        initialEntries,
      });
      cy.fixture('hosts.json')
        .its('results')
        .should('be.an', 'array')
        .then((results: AwxHost[]) => {
          const host = results[0];
          cy.contains(host.name);
          if (kind === '') {
            cy.get('[data-cy="actions-column-cell"]').should(
              'have.descendants',
              '[data-cy="edit-host"]'
            );
          } else {
            cy.get('[data-cy="actions-column-cell"]').should(
              'not.have.descendants',
              '[data-cy="edit-host"]'
            );
          }
        });
    });

    it(`try disassociate group host from toolbar menu (${kind === '' ? 'inventory' : kind})`, () => {
      cy.mount(<GroupHosts />, {
        path,
        initialEntries,
      });
      cy.fixture('hosts.json')
        .its('results')
        .should('be.an', 'array')
        .then(() => {
          if (kind === '') {
            cy.get('[data-cy="checkbox-column-cell"] > label > input').click();
            cy.get('[data-cy="disassociate-selected-hosts"]').click();
            cy.contains('Disassociate host from group?');
          } else {
            cy.get('body').should(
              'not.have.descendants',
              '[data-cy="disassociate-selected-hosts"]'
            );
          }
        });
    });
  });
});
