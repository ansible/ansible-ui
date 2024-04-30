import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { InstanceGroupDetails } from './InstanceGroupDetails';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

describe('Instance Group Details', () => {
  it('Render instance group details', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/instance_groups/*' },
      { fixture: 'instance_group.json' }
    );
    cy.mount(<InstanceGroupDetails />, {
      path: 'instance_groups/:id/details',
      initialEntries: ['/instance_groups/1/details'],
    });
    cy.fixture('instance_group').then((instance_group: InstanceGroup) => {
      cy.get('[data-cy="name"]').should('have.text', instance_group.name);
      cy.get('[data-cy="type"]').should('have.text', 'Instance Group');
      cy.get('[data-cy="policy-instance-minimum"]').should(
        'have.text',
        instance_group.policy_instance_minimum
      );
      cy.get('[data-cy="policy-instance-percentage"]').should(
        'have.text',
        `${instance_group.policy_instance_percentage}%`
      );
      cy.get('[data-cy="max-concurrent-jobs"]').should(
        'have.text',
        instance_group.max_concurrent_jobs
      );
      cy.get('[data-cy="max-forks"]').should('have.text', instance_group.max_forks);
      cy.get('[data-cy="used-capacity"]').should('have.text', instance_group.consumed_capacity);
      cy.get('[data-cy="created"]').should('have.text', formatDateString(instance_group.created));
      cy.get('[data-cy="last-modified"]').should(
        'have.text',
        formatDateString(instance_group.modified)
      );
    });
  });
  it('Render container group details', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/instance_groups/*' },
      { fixture: 'container_group.json' }
    );
    cy.mount(<InstanceGroupDetails />, {
      path: 'instance_groups/:id/details',
      initialEntries: ['/instance_groups/2/details'],
    });
    cy.fixture('container_group').then((container_group: InstanceGroup) => {
      cy.get('[data-cy="name"]').should('have.text', container_group.name);
      cy.get('[data-cy="type"]').should('have.text', 'Container Group');
      cy.get('[data-cy="policy-instance-minimum"]').should('not.exist');
      cy.get('[data-cy="policy-instance-percentage"]').should('not.exist');
      cy.get('[data-cy="max-concurrent-jobs"]').should(
        'have.text',
        container_group.max_concurrent_jobs
      );
      cy.get('[data-cy="max-forks"]').should('have.text', container_group.max_forks);
      cy.get('[data-cy="used-capacity"]').should('not.exist');
      cy.get('[data-cy="created"]').should('have.text', formatDateString(container_group.created));
      cy.get('[data-cy="last-modified"]').should(
        'have.text',
        formatDateString(container_group.modified)
      );
    });
  });
});
