import { CreateWorkflowJobTemplate } from './WorkflowJobTemplateForm';
import { awxAPI } from '../../../../cypress/support/formatApiPathForAwx';

describe('Create job template ', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/labels/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'labels.json',
      }
    ).as('labelsFetched');
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
  });

  it('Create Workflow Job Template - Displays error message on internal server error', () => {
    cy.mount(<CreateWorkflowJobTemplate />);
    cy.get('[data-cy="name"]').type('Test');
  });

  it('Component renders', () => {
    cy.mount(<CreateWorkflowJobTemplate />);
    cy.verifyPageTitle('Create workflow job template');
  });

  it('Validates properly', () => {
    cy.mount(<CreateWorkflowJobTemplate />);
    cy.clickButton(/^Create workflow job template$/);
    cy.contains(`Name is required.`).should('be.visible');
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateWorkflowJobTemplate />);
    cy.get('[data-cy="name"]').type('Test');
    cy.selectDropdownOptionByResourceName('inventory', 'Demo Inventory');
    cy.clickButton('Create workflow job template');
    cy.intercept('POST', awxAPI`/workflow_job_templates/`, (req) => {
      expect(req.body).to.contain({
        inventory: 9,
        name: 'Test',
      });
    });
  });
});
