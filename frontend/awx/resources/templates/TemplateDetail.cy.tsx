/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { TemplateDetail } from './TemplateDetail';
import { MemoryRouter } from 'react-router-dom';

describe('TemplateDetails', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/job_templates/*',
        hostname: 'localhost',
      },
      {
        fixture: 'jobTemplate.json',
      }
    );
  });
  it('Component renders and displays jobTemplate', () => {
    cy.mount(
      <MemoryRouter>
        <TemplateDetail />
      </MemoryRouter>
    );
    cy.contains('dd#name>div', 'JT with Default Cred').should('exist');
  });

  it('Launches a job that does not need any prompting', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/7/launch/', hostname: 'localhost' },
      { fixture: 'jobTemplateLaunch.json' }
    ).as('getLaunchConfig');
    cy.intercept('POST', '/api/v2/job_templates/7/launch/', (req) => {
      return req.reply({ statusCode: 200, body: { id: 1000, type: 'job' } });
    }).as('launchJob');

    cy.mount(
      <MemoryRouter>
        <TemplateDetail />
      </MemoryRouter>
    );
    cy.get('button.toggle-kebab').click();
    cy.contains('a', 'Launch template').click();

    cy.wait('@getLaunchConfig');
    cy.wait('@launchJob');
  });
  // it('Fetches prompt data', () => {});
  // it('Renders prompt on launch workflow', () => {});
  // it('Navigates to the job output view after successful launch', () => {});
  // it('Handles HTTP errors properly', () => {});
});
