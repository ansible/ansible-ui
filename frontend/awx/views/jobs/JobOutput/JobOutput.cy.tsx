import job from '../../../../../cypress/fixtures/job.json';
import type { Job } from '../../../interfaces/Job';
import { JobOutputInner as JobOutput } from './JobOutput';
import { awxAPI } from '../../../../../cypress/support/formatApiPathForAwx';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { JobEvent } from '../../../interfaces/JobEvent';

describe('JobOutput.cy.tsx', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/jobs/26/job_events/?order_by=counter&page=1&page_size=200`,
        hostname: 'localhost',
      },
      {
        fixture: 'jobEvents.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/jobs/26/job_events/?order_by=counter&page=1&page_size=200&search=World`,
        hostname: 'localhost',
      },
      {
        fixture: 'filteredJobEvents.json',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/jobs/26/job_events/children_summary/`,
        hostname: 'localhost',
      },
      {
        fixture: 'jobChildrenSummary.json',
      }
    ).as('childrenSummary');
  });

  it('renders job output', () => {
    cy.mount(<JobOutput job={job as unknown as Job} reloadJob={() => null} />);
    cy.get('h1').should('have.text', 'Demo Job Template');
    cy.get('.output-grid').find('.output-grid-row').should('have.length', 13);
  });

  it('renders filter options with all the filterable keys', () => {
    cy.intercept(
      { method: 'OPTIONS', url: awxAPI`/jobs/26/job_events/` },
      { fixture: 'jobEventsOptions.json' }
    );
    cy.mount(<JobOutput job={job as unknown as Job} reloadJob={() => null} />);
    cy.get('button[id="filter"]').click();
    cy.get('li.pf-v5-c-menu__list-item').should('have.length', 22);
  });

  it('collapses play output', () => {
    cy.mount(<JobOutput job={job as unknown as Job} reloadJob={() => null} />);
    cy.get('.output-grid').find('.output-grid-row').should('have.length', 13);
    cy.wait('@childrenSummary');
    cy.get('.output-grid').find('button > svg').first().click();
    cy.get('.output-grid').find('.output-grid-row').should('have.length', 5);
  });

  it('ensure filtered job output host modal displays and shows correct data', () => {
    cy.intercept(
      { method: 'OPTIONS', url: awxAPI`/jobs/26/job_events/` },
      { fixture: 'jobEventsOptions.json' }
    );
    cy.mount(<JobOutput job={job as unknown as Job} reloadJob={() => null} />);
    cy.get('div[id="filter-input"]').type('World');
    cy.contains('div.output-grid-row', 'Hello World!').click();
    cy.get('button[data-ouia-component-id="data-tab"]').click();
    cy.get('[data-cy="code-block-value"]').should('contain.text', 'Hello World!');
  });
  it('Ensure no notification shows up when no websocket', () => {
    const modifiedJob = { ...job, status: 'running' };
    cy.mount(<JobOutput job={modifiedJob as unknown as Job} reloadJob={() => null} />);
    cy.get('[data-cy="alert-toaster"]').should(
      'not.contain.text',
      'Websocket unavailable. You may experience degraded logging performance.'
    );
  });
  it('Ensure no notification shows up when waiting on playbook execution', () => {
    const modifiedJob = { ...job, status: 'running' };
    cy.fixture('jobEvents.json').then((jobEvents: AwxItemsResponse<JobEvent>) => {
      jobEvents.results[0].event = 'playbook_on_start';
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/jobs/26/job_events/?page_size=1&counter=1`,
          hostname: 'localhost',
        },
        jobEvents
      );
    });
    cy.mount(<JobOutput job={modifiedJob as unknown as Job} reloadJob={() => null} />);
    cy.getByDataCy('waiting-label').should('not.exist');
  });
  it('Ensure notification shows up when waiting on playbook execution', () => {
    const modifiedJob = { ...job, status: 'running' };
    cy.fixture('jobEvents.json').then((jobEvents: AwxItemsResponse<JobEvent>) => {
      jobEvents.results[0].event = 'playbook_on_setup';
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/jobs/26/job_events/?page_size=1&counter=1`,
          hostname: 'localhost',
        },
        {
          fixture: 'jobEvents.json',
        }
      );
    });
    cy.mount(<JobOutput job={modifiedJob as unknown as Job} reloadJob={() => null} />);
    cy.getByDataCy('waiting-label').should(
      'contain.text',
      'Running initial setup. Waiting to execute playbook'
    );
  });
});
