import { JobHeader } from './JobHeader';

describe('Job Page', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/workflow_jobs/*',
      },
      {
        fixture: 'running_job.json',
      }
    );
  });
  it('job header should have relaunch and cancel buttons on a running job', () => {
    cy.mount(<JobHeader />, { path: ':job_type/:id', initialEntries: ['/workflow/1'] });
    cy.get('[data-cy="relaunch-job"]').should('contain', 'Relaunch job');
    cy.get('[data-cy="cancel-job"]').should('contain', 'Cancel job');
  });
});
