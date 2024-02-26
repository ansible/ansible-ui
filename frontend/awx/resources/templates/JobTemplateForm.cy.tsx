import { CreateJobTemplate } from './TemplateForm';
import { awxAPI } from '../../common/api/awx-utils';
import type { InstanceGroup } from '../../interfaces/InstanceGroup';

describe('Create job template ', () => {
  const instanceGroups: Partial<InstanceGroup>[] = [{ id: 123, name: 'default_group' }];
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/labels/*',
        hostname: 'localhost',
      },
      {
        fixture: 'labels.json',
      }
    ).as('labelsFetched');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/projects/*',
        hostname: 'localhost',
      },
      {
        fixture: 'projects.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credential_types/*',
        hostname: 'localhost',
      },
      {
        fixture: 'credential_types.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credentials/*',
        hostname: 'localhost',
      },
      {
        fixture: 'credentials.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/instance_groups/*',
      },
      { count: 1, results: instanceGroups }
    ).as('getInstanceGroups');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/projects/6/playbooks/',
        hostname: 'localhost',
      },
      {
        fixture: 'playbooks.json',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/inventories/*',
        hostname: 'localhost',
      },
      {
        fixture: 'inventories.json',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/execution_environments/*',
        hostname: 'localhost',
      },
      {
        fixture: 'execution_environments.json',
      }
    );

    cy.intercept(
      { method: 'POST', url: '/api/v2/projects/*', hostname: 'localhost' },
      { fixture: 'project.json' }
    ).as('selectedProject');
  });

  it('Component renders', () => {
    cy.mount(<CreateJobTemplate />);
    cy.verifyPageTitle('Create Job Template');
  });

  it('Should display field error messages on internal server error', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventories/*' },
      { statusCode: 500, message: 'Internal Server Error' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/projects/*' },
      { statusCode: 500, message: 'Internal Server Error' }
    );
    cy.mount(<CreateJobTemplate />);
    cy.contains('Error loading inventories').should('be.visible');
    cy.contains('Error loading projects').should('be.visible');
  });

  it('Should validate required form fields', () => {
    cy.mount(<CreateJobTemplate />);
    cy.clickButton(/^Create job template$/);
    ['Name', 'Inventory', 'Project', 'Playbook'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should send expected form data to API on save', () => {
    cy.intercept('POST', '/api/v2/job_templates/', (req) => {
      expect(req.body).to.contain({
        inventory: 1,
        job_type: 'check',
        name: 'Test',
        playbook: 'hello_world.yml',
        project: 6,
      });
      return req.reply({ statusCode: 200, body: { id: 1000, type: 'job' } });
    });
    cy.intercept('GET', awxAPI`/job_templates/1000/instance_groups/`, {
      count: 0,
      results: [],
    });
    cy.intercept('POST', awxAPI`/job_templates/1000/instance_groups/`, (req) => {
      expect(req.body).to.contain({
        id: instanceGroups[0].id,
      });
      return req.reply({ statusCode: 204 });
    });

    cy.mount(<CreateJobTemplate />);
    cy.get('[data-cy="name"]').type('Test');
    cy.get('button[aria-describedby="job_type-form-group"]').click();
    cy.clickButton(/^Check$/);
    cy.selectDropdownOptionByResourceName('inventory', 'Demo Inventory');
    cy.selectDropdownOptionByResourceName('project', 'Demo Project').as('ProjectInput');
    cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
    cy.wait('@getInstanceGroups')
      .its('response.body.results')
      .then(() => {
        cy.get(`[data-cy*="instance-group-select-form-group"]`).within(() => {
          cy.get('button').eq(1).click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click();
          });
          cy.clickButton(/^Confirm/);
        });
      });
    cy.clickButton('Create job template');
  });
});
