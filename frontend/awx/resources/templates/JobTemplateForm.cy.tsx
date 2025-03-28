import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import type { InstanceGroup } from '../../interfaces/InstanceGroup';
import { CreateJobTemplate } from './TemplateForm';

describe('Create job template ', () => {
  it('Component renders', () => {
    cy.mount(<CreateJobTemplate />);
    cy.verifyPageTitle('Create job template');
  });

  it('Should validate required form fields', () => {
    cy.mount(<CreateJobTemplate />);
    cy.clickButton(/^Create job template$/);

    ['Name', 'Inventory', 'Project', 'Playbook'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should send expected form data to API on save', () => {
    const instanceGroups: Pick<InstanceGroup, 'id' | 'name'>[] = [
      { id: 123, name: 'default_group' },
    ];
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/inventories/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'inventories.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/projects/?page_size=10&order_by=name*`,
        hostname: 'localhost',
      },
      {
        fixture: 'projects.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/instance_groups/*`,
      },
      { count: 1, results: instanceGroups }
    ).as('getInstanceGroups');
    cy.intercept('POST', awxAPI`/job_templates/`, (req) => {
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
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/projects/6/playbooks/`,
        hostname: 'localhost',
      },
      {
        fixture: 'playbooks.json',
      }
    );
    cy.mount(<CreateJobTemplate />);
    cy.get('[data-cy="name"]').type('Test');
    cy.get('[data-cy="job_type-form-group"] button').last().click();
    cy.contains('Check').click();
    cy.singleSelectBy('[data-cy="inventory"]', 'Demo Inventory');
    cy.selectAsyncSingleSelectOption('project-select', 'Demo Project');
    cy.get('[data-cy="playbook-form-group"] input').clear().type('hello_world.yml');
    cy.get('#playbook-typeahead-select button').contains('hello_world.yml').click();
    cy.multiSelectByDataCy('instance-group-select-form-group', [instanceGroups[0].name]);
    cy.clickButton('Create job template');
  });
});
