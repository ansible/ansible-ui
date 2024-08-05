import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { CreateInstanceGroup, EditInstanceGroup } from './InstanceGroupForm';

describe('Create Edit Instance Group Form', () => {
  describe('Create instance group', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/v2/instance_groups/', {
        statusCode: 201,
        fixture: 'execution_environment.json',
      }).as('createIG');
    });
    it('should validate required fields on save', () => {
      cy.mount(<CreateInstanceGroup />);
      cy.clickButton(/^Create instance group$/);
      cy.contains('Name is required.').should('be.visible');
    });

    it('should create instance group with only required values passed', () => {
      cy.mount(<CreateInstanceGroup />);
      cy.get('[data-cy="name"]').type('Test name');

      cy.get('[data-cy="policy-instance-minimum"]').clear();
      cy.get('[data-cy="policy-instance-minimum"]').type('1');

      cy.get('[data-cy="policy-instance-percentage"]').clear();
      cy.get('[data-cy="policy-instance-percentage"]').type('2');

      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');

      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');
      cy.clickButton(/^Create instance group$/);
      cy.wait('@createIG')
        .its('request.body')
        .then((createdIG) => {
          expect(createdIG).to.deep.equal({
            name: 'Test name',
            policy_instance_minimum: 1,
            policy_instance_percentage: 2,
            max_concurrent_jobs: 3,
            max_forks: 4,
          });
        });
    });
  });
  describe('Edit Instance Group', () => {
    beforeEach(() => {
      cy.intercept('GET', `api/v2/instance_groups/*`, {
        fixture: 'instance_group.json',
      });
      cy.intercept('PATCH', '/api/v2/instance_groups/*', {}).as('editIg');
    });

    it('should preload the form with current values', () => {
      cy.mount(<EditInstanceGroup />, {
        path: '/instance-groups/:id/edit',
        initialEntries: [`/instance-groups/1/edit`],
      });
      cy.verifyPageTitle('Edit controlplane');
      cy.get('[data-cy="name"]').should('have.value', 'controlplane');
      cy.get('[data-cy="policy-instance-minimum"]').should('have.value', '0');
      cy.get('[data-cy="policy-instance-percentage"]').should('have.value', '100');
      cy.get('[data-cy="max-concurrent-jobs"]').should('have.value', '23');
      cy.get('[data-cy="max-forks"]').should('have.value', '12');
    });

    it('should pass correct request body after editing ee', () => {
      cy.mount(<EditInstanceGroup />, {
        path: '/instance-groups/:id/edit',
        initialEntries: [`/instance-groups/1/edit`],
      });
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Test name- edited');

      cy.get('[data-cy="policy-instance-minimum"]').clear();
      cy.get('[data-cy="policy-instance-minimum"]').type('1');

      cy.get('[data-cy="policy-instance-percentage"]').clear();
      cy.get('[data-cy="policy-instance-percentage"]').type('2');

      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');

      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');

      cy.getByDataCy('Submit').click();
      cy.wait('@editIg')
        .its('request.body')
        .then((editedIG: InstanceGroup) => {
          expect(editedIG.name).to.equal('Test name- edited');
          expect(editedIG.policy_instance_minimum).to.equal(1);
          expect(editedIG.policy_instance_percentage).to.equal(2);
          expect(editedIG.max_concurrent_jobs).to.equal(3);
          expect(editedIG.max_forks).to.equal(4);
        });
    });

    it('should validate required fields on save', () => {
      cy.mount(<EditInstanceGroup />, {
        path: '/instance-groups/:id/edit',
        initialEntries: [`/instance-groups/1/edit`],
      });
      cy.get('[data-cy="name"]').clear();
      cy.getByDataCy('Submit').click();
      cy.contains('.pf-v5-c-helper-text', 'Name is required.');
    });
  });
});
