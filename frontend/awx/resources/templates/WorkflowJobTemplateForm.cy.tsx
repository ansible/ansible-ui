import { CreateWorkflowJobTemplate } from './WorkflowJobTemplateForm';

describe('Create job template ', () => {
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
        url: '/api/v2/inventories/*',
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
    cy.verifyPageTitle('Create Workflow Job Template');
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

    cy.intercept('POST', '/api/v2/workflow_job_templates/', (req) => {
      expect(req.body).to.contain({
        inventory: 9,
        name: 'Test',
      });
    });
  });
});
