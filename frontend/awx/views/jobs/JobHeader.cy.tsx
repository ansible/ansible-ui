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
  it('Relaunch and cancel buttons are visible on a running job', () => {
    cy.mount(<JobHeader />, { path: ':job_type/:id', initialEntries: ['/workflow/1'] });
    cy.get('[data-cy="relaunch-job-with"]').should('exist');
    cy.get('[data-cy="relaunch-job-with"]').click();
    cy.get('[data-cy="job-type-run"]').should('exist');
    cy.get('[data-cy="job-type-check"]').should('exist');
    cy.get('[data-cy="cancel-job"]').should('contain', 'Cancel job');
  });
  it('Delete button is disabled on a running job', () => {
    cy.mount(<JobHeader />, { path: ':job_type/:id', initialEntries: ['/workflow/1'] });
    cy.getByDataCy('actions-dropdown').click();
    cy.contains('#delete-job', /^Delete job$/).should('have.attr', 'aria-disabled', 'true');
  });
  it('Delete button is enabled on a finished job', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/workflow_jobs/*',
      },
      {
        fixture: 'workflow_job.json',
      }
    );
    cy.mount(<JobHeader />, { path: ':job_type/:id', initialEntries: ['/workflow/1'] });
    cy.getByDataCy('actions-dropdown').click();
    cy.contains('#delete-job', /^Delete job$/).should('not.have.attr', 'aria-disabled', 'true');
  });
  it('Cancel button is disabled on a finished job', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/workflow_jobs/*',
      },
      {
        fixture: 'workflow_job.json',
      }
    );
    cy.mount(<JobHeader />, { path: ':job_type/:id', initialEntries: ['/workflow/1'] });
    cy.getByDataCy('actions-dropdown').click();
    cy.contains('[data-cy="cancel-job"]', 'Cancel job').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
  });
});
