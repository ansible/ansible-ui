/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { WorkflowJobTemplatePage } from './WorkflowJobTemplatePage';
import { RouteObj } from '../../../../common/Routes';

describe('WorflowJobTemplatePage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*', hostname: 'localhost' },
      { fixture: 'workflowJobTemplate.json' }
    );
  });

  it('Component renders and displays jobTemplate', () => {
    cy.mount(<WorkflowJobTemplatePage />, {
      path: RouteObj.WorkflowJobTemplatePage,
      initialEntries: [RouteObj.WorkflowJobTemplateDetails.replace(':id', '1')],
    });
    cy.contains('dd#name>div', 'E2E 6GDe').should('exist');
  });

  it('Launches a job that does not need any prompting', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*/launch/', hostname: 'localhost' },
      { fixture: 'workflowJobTemplateLaunch.json' }
    ).as('getLaunchConfig');

    cy.intercept('POST', '/api/v2/workflow_job_templates/*/launch/', (req) => {
      return req.reply({ statusCode: 200, body: { id: 1000, type: 'job' } });
    }).as('launchJob');

    cy.mount(<WorkflowJobTemplatePage />, {
      path: RouteObj.WorkflowJobTemplatePage,
      initialEntries: [RouteObj.WorkflowJobTemplateDetails.replace(':id', '1')],
    });

    cy.clickPageAction(/^Launch template$/);

    cy.wait('@getLaunchConfig');
    cy.wait('@launchJob');
  });
  // it('Fetches prompt data', () => {});
  // it('Renders prompt on launch workflow', () => {});
  // it('Navigates to the job output view after successful launch', () => {});
  // it('Handles HTTP errors properly', () => {});
});
