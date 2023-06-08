import { JobOutput } from './JobOutput';
import job from '../../../../../cypress/fixtures/job.json';
import type { Job } from '../../../interfaces/Job';

describe('JobOutput.cy.tsx', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/jobs/26/job_events/?order_by=counter&page=1&page_size=50',
        hostname: 'localhost',
      },
      {
        fixture: 'jobEvents.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/jobs/26/job_events/children_summary',
        hostname: 'localhost',
      },
      {
        fixture: 'jobChildrenSummary.json',
      }
    );
  });

  it('renders job output', () => {
    cy.mount(<JobOutput job={job as unknown as Job} />);
    cy.get('h1').should('have.text', 'Demo Job Template');
    cy.get('.output-grid').find('.output-grid-row').should('have.length', 13);
  });

  it('collapses play output', () => {
    cy.mount(<JobOutput job={job as unknown as Job} />);
    cy.get('.output-grid').find('.output-grid-row').should('have.length', 13);
    cy.get('.output-grid').find('button > svg').first().click();
    cy.get('.output-grid').find('.output-grid-row').should('have.length', 5);
  });
});
