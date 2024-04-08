/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Organization } from '../../../interfaces/Organization';
import { TemplatePage } from './TemplatePage';

describe('TemplatePage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*', hostname: 'localhost' },
      { fixture: 'jobTemplate.json' }
    );
    cy.fixture('organizations').then((organizations: AwxItemsResponse<Organization[]>) => {
      cy.intercept(
        'GET',
        'api/v2/organizations/?role_level=notification_admin_role',
        organizations
      );
    });
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/1/instance_groups', hostname: 'localhost' },
      { fixture: 'instance_groups.json' }
    );
  });

  it('Component renders and displays jobTemplate', () => {
    cy.mount(<TemplatePage />);
    cy.get('h1').should('have.text', 'JT with Default Cred');
  });

  it('Launches a job that does not need any prompting', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations/?role_level=notification_admin_role',
        hostname: 'localhost',
      },
      { fixture: 'organizations.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*/launch/', hostname: 'localhost' },
      { fixture: 'jobTemplateLaunch.json' }
    ).as('getLaunchConfig');

    cy.intercept('POST', '/api/v2/job_templates/*/launch/', (req) => {
      return req.reply({ statusCode: 200, body: { id: 1000, type: 'job' } });
    }).as('launchJob');

    cy.mount(<TemplatePage />);

    cy.clickButton(/^Launch template$/);

    cy.wait('@getLaunchConfig');
    cy.wait('@launchJob');
  });

  it('Handles HTTP errors properly', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations/?role_level=notification_admin_role',
        hostname: 'localhost',
      },
      { fixture: 'organizations.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*/launch/', hostname: 'localhost' },
      { fixture: 'jobTemplateLaunch.json' }
    ).as('getLaunchConfig');

    cy.intercept('POST', '/api/v2/job_templates/*/launch/', (req) => {
      return req.reply({ statusCode: 400, body: { message: 'Could not launch job' } });
    }).as('launchJob');
    cy.mount(<TemplatePage />);

    cy.clickButton(/^Launch template$/);

    cy.wait('@getLaunchConfig');
    cy.wait('@launchJob');
    cy.get('.pf-v5-c-alert__title').contains('Failed to launch template');
  });
  it('Should render the proper tabs for a super user', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations/?role_level=notification_admin_role',
        hostname: 'localhost',
      },
      { fixture: 'organizations.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*/launch/', hostname: 'localhost' },
      { fixture: 'jobTemplateLaunch.json' }
    ).as('getLaunchConfig');
    const tabNames: string[] = [
      'Back to Templates',
      'Details',
      'Access',
      'Schedules',
      'Jobs',
      'Survey',
      'Notifications',
    ];
    cy.mount(<TemplatePage />);

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 7);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });

  it('Should show all tabs because user is system auditor', () => {
    cy.fixture('organizations.json').then((organizations: { count: number; results: [] }) => {
      organizations.count = 0;
      organizations.results = [];
      cy.intercept(
        'GET',
        '/api/v2/organizations/?role_level=notification_admin_role',
        organizations
      ).as('getOrganizations');
    });
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*/launch/', hostname: 'localhost' },
      { fixture: 'jobTemplateLaunch.json' }
    ).as('getLaunchConfig');
    const tabNames: string[] = [
      'Back to Templates',
      'Details',
      'Access',
      'Schedules',
      'Jobs',
      'Survey',
      'Notifications',
    ];
    cy.mount(<TemplatePage />, undefined, 'activeUserSysAuditor');

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', tabNames.length);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });

  it('Should not show notifications tab, because of RBAC', () => {
    cy.fixture('organizations.json').then((organizations: { count: number; results: [] }) => {
      organizations.count = 0;
      organizations.results = [];

      cy.intercept(
        'GET',
        '/api/v2/organizations/?role_level=notification_admin_role',
        organizations
      ).as('getOrganizations');
    });
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*/launch/', hostname: 'localhost' },
      { fixture: 'jobTemplateLaunch.json' }
    ).as('getLaunchConfig');
    const tabNames: string[] = [
      'Back to Templates',
      'Details',
      'Access',
      'Schedules',
      'Jobs',
      'Survey',
    ];

    cy.mount(<TemplatePage />);
    cy.wait('@getOrganizations');

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', tabNames.length);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });
});
