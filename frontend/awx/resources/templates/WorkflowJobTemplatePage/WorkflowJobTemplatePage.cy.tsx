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
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations?role_level=notification_admin_role',
        hostname: 'localhost',
      },
      { fixture: 'organizations.json' }
    );
    cy.mount(
      <WorkflowJobTemplatePage />,
      {
        path: RouteObj.WorkflowJobTemplatePage,
        initialEntries: [RouteObj.WorkflowJobTemplateDetails.replace(':id', '1')],
      },
      'activeUserSysAuditor'
    );
    cy.contains('dd#name>div', 'E2E 6GDe').should('exist');
  });

  it('Launches a job that does not need any prompting', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations?role_level=notification_admin_role',
        hostname: 'localhost',
      },
      { fixture: 'organizations.json' }
    );
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
  it('Handles HTTP errors properly', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations?role_level=notification_admin_role',
        hostname: 'localhost',
      },
      { fixture: 'organizations.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*/launch/', hostname: 'localhost' },
      { fixture: 'workflowJobTemplateLaunch.json' }
    ).as('getLaunchConfig');

    cy.intercept('POST', '/api/v2/workflow_job_templates/*/launch/', (req) => {
      return req.reply({ statusCode: 400, body: { message: 'Could not launch job' } });
    }).as('launchJob');
    cy.mount(<WorkflowJobTemplatePage />, {
      path: RouteObj.WorkflowJobTemplatePage,
      initialEntries: [RouteObj.WorkflowJobTemplateDetails.replace(':id', '1')],
    });

    cy.clickPageAction(/^Launch template$/);

    cy.wait('@getLaunchConfig');
    cy.wait('@launchJob');
    cy.get('div.pf-c-alert__description').contains('Could not launch job');
  });
  it('Should render the proper tabs for a super user', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations?role_level=notification_admin_role',
        hostname: 'localhost',
      },
      { fixture: 'organizations.json' }
    );
    const tabNames: string[] = [
      'Back to Templates',
      'Details',
      'Access',
      'Notifications',
      'Schedules',
      'Jobs',
      'Survey',
      'Visualizer',
    ];
    cy.mount(<WorkflowJobTemplatePage />, {
      path: RouteObj.WorkflowJobTemplatePage,
      initialEntries: [RouteObj.WorkflowJobTemplateDetails.replace(':id', '1')],
    });
    const tabs = cy.get('.pf-c-tabs__list');
    tabs.children().should('have.length', 8);
    tabs.children().each((tab, index) => {
      cy.wrap(tab).should('contain', tabNames[index]);
    });
  });
  it('Should show all tabs because user is system auditor', () => {
    cy.fixture('organizations.json').then((organizations: { count: number; results: [] }) => {
      organizations.count = 0;
      organizations.results = [];

      cy.intercept(
        'GET',
        '/api/v2/organizations?role_level=notification_admin_role',
        organizations
      ).as('getOrganizations');
    });
    const tabNames: string[] = [
      'Back to Templates',
      'Details',
      'Access',
      'Notifications',
      'Schedules',
      'Jobs',
      'Survey',
      'Visualizer',
    ];
    cy.mount(
      <WorkflowJobTemplatePage />,
      {
        path: RouteObj.WorkflowJobTemplatePage,
        initialEntries: [RouteObj.WorkflowJobTemplateDetails.replace(':id', '1')],
      },
      'activeUserSysAuditor'
    );
    const allTabs = cy.get('.pf-c-tabs__list');
    allTabs.children().should('have.length', 8);
    allTabs.children().each((tab, index) => {
      cy.wrap(tab).should('contain', tabNames[index]);
    });
  });
  it('Should not show notifications tab', () => {
    cy.fixture('organizations.json').then((organizations: { count: number; results: [] }) => {
      organizations.count = 0;
      organizations.results = [];

      cy.intercept(
        'GET',
        '/api/v2/organizations?role_level=notification_admin_role',
        organizations
      ).as('getOrganizations');
    });

    const tabNames: string[] = [
      'Back to Templates',
      'Details',
      'Access',
      'Schedules',
      'Jobs',
      'Survey',
      'Visualizer',
    ];

    cy.mount(<WorkflowJobTemplatePage />, {
      path: RouteObj.WorkflowJobTemplatePage,
      initialEntries: [RouteObj.WorkflowJobTemplateDetails.replace(':id', '1')],
    });
    cy.wait('@getOrganizations');
    const fewerTabs = cy.get('.pf-c-tabs__list');
    fewerTabs.children().should('have.length', 7);
    fewerTabs.children().each((tab, index) => {
      cy.wrap(tab).should('have.text', tabNames[index]);
    });
  });
});
