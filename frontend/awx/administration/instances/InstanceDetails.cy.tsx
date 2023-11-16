import { formatDateString } from '../../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';
import { Instance } from '../../interfaces/Instance';
import { InstanceDetails } from './InstanceDetails';

describe('Mesh Visualizer', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '/api/v2/instances/*' }, { fixture: 'instance.json' }).as(
      'getInstance'
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/instances/*/instance_groups/' },
      { fixture: 'instance_groups.json' }
    ).as('getInstanceGroups');
  });

  it('Renders name, node type, node status, instance groups, download bundle, used capacity, running jobs, total jobs, policy type, memory, last health check, created, modified, forks, and enabled fields', () => {
    cy.mount(<InstanceDetails />);
    cy.wait('@getInstance')
      .its('response.body')
      .then((instance: Instance) => {
        cy.get('[data-cy="name"]').should('have.text', instance.hostname);
        cy.get('[data-cy="node-type"]').should(
          'have.text',
          `${capitalizeFirstLetter(instance.node_type)}`
        );
        cy.get('[data-cy="status"] .pf-v5-c-label__text').should(
          'have.text',
          `${capitalizeFirstLetter(instance.node_state)}`
        );
        cy.get('[data-cy="instance-groups"]').should('exist');
        if (instance.related.install_bundle) {
          cy.get('[data-cy="download-bundle"]').should('exist');
        }
        cy.get('[data-cy="used-capacity"]').should(
          'have.text',
          `${Math.round(100 - instance.percent_capacity_remaining)}%`
        );
        cy.get('[data-cy="running-jobs"]').should('have.text', instance.jobs_running.toString());
        cy.get('[data-cy="total-jobs"]').should('have.text', instance.jobs_total.toString());
        cy.get('[data-cy="policy-type"]').should(
          'have.text',
          instance.managed_by_policy ? 'Auto' : 'Manual'
        );
        cy.get('[data-cy="memory"]').should('exist');
        cy.get('[data-cy="last-health-check"]').should(
          'have.text',
          formatDateString(instance.last_health_check)
        );
        cy.get('[data-cy="created"]').should('have.text', formatDateString(instance.created));
        cy.get('[data-cy="modified"]').should('have.text', formatDateString(instance.modified));
        cy.get('[data-cy="forks"]').should('exist');
        cy.get('[data-cy="enabled"]').should('exist');
      });
  });
});
