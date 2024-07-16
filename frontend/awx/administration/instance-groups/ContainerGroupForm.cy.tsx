import { InstanceGroup as ContainerGroup } from '../../interfaces/InstanceGroup';
import { CreateContainerGroup, EditContainerGroup } from './ContainerGroupForm';

describe('Create Edit Container Group Form', () => {
  describe('Create container group', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/instance_groups' },
        {
          fixture: 'instanceGroupOptions.json',
        }
      ).as('options');
      cy.intercept({ method: 'GET', url: '/api/v2/credentials' }, { fixture: 'credentials.json' });
      cy.intercept('POST', '/api/v2/instance_groups/', {
        statusCode: 201,
        fixture: 'container_group.json',
      }).as('createIG');
    });
    it('should validate required fields on save', () => {
      cy.mount(<CreateContainerGroup />);
      cy.clickButton(/^Create container group$/);
      cy.contains('Name is required.').should('be.visible');
    });

    it('should create container group with only required values passed', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/credentials/*' },
        { fixture: 'credentials.json' }
      );
      cy.mount(<CreateContainerGroup />, {
        path: '/instance-groups/container-group/create',
        initialEntries: [`/instance-groups/container-group/create`],
      });
      cy.get('[data-cy="name"]').type('Test name');
      cy.selectSingleSelectOption('[data-cy="credential"]', 'E2E Credential ARWM');
      cy.getByDataCy('override').click({ force: true });
      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');
      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');
      cy.clickButton(/^Create container group$/);
      cy.wait('@createIG')
        .its('request.body')
        .then((createdIG) => {
          expect(createdIG).to.deep.equal({
            name: 'Test name',
            credential: 187,
            is_container_group: true,
            max_concurrent_jobs: 3,
            max_forks: 4,
            pod_spec_override:
              "apiVersion: v1\nkind: Pod\nmetadata:\n  namespace: dev-ui\nspec:\n  serviceAccountName: default\n  automountServiceAccountToken: false\n  containers:\n    - image: quay.io/ansible/awx-ee:latest\n      name: worker\n      args:\n        - ansible-runner\n        - worker\n        - '--private-data-dir=/runner'\n      resources:\n        requests:\n          cpu: 250m\n          memory: 100Mi",
          });
        });
    });
  });
  describe('Edit Container Group', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/instance_groups' },
        {
          fixture: 'instanceGroupOptions.json',
        }
      ).as('options');
      cy.intercept('GET', `api/v2/instance_groups/*`, {
        fixture: 'container_group.json',
      });
      cy.intercept(
        { method: 'GET', url: '/api/v2/credentials/*' },
        { fixture: 'credentials.json' }
      );
      cy.intercept('PATCH', '/api/v2/instance_groups/*', {}).as('editCg');
    });

    it('should preload the form with current values', () => {
      cy.mount(<EditContainerGroup />, {
        path: '/instance-groups/container-group/:id/edit',
        initialEntries: [`/instance-groups/container-group/1/edit`],
      });
      cy.verifyPageTitle('Edit Test Container Group');
      cy.get('[data-cy="name"]').should('have.value', 'Test Container Group');
      cy.get('[data-cy="max-concurrent-jobs"]').should('have.value', '23');
      cy.get('[data-cy="max-forks"]').should('have.value', '12');
    });

    it('should pass correct request body after editing ee', () => {
      cy.mount(<EditContainerGroup />, {
        path: '/instance_groups/container-group/:id/edit',
        initialEntries: [`/instance_groups/container-group/1/edit`],
      });
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Test name- edited');

      cy.get('[data-cy="max-concurrent-jobs"]').clear();
      cy.get('[data-cy="max-concurrent-jobs"]').type('3');

      cy.get('[data-cy="max-forks"]').clear();
      cy.get('[data-cy="max-forks"]').type('4');

      cy.clickButton(/^Save container group$/);
      cy.wait('@editCg')
        .its('request.body')
        .then((editedCg: ContainerGroup) => {
          expect(editedCg.name).to.equal('Test name- edited');
          expect(editedCg.max_concurrent_jobs).to.equal(3);
          expect(editedCg.max_forks).to.equal(4);
        });
    });
  });
});
