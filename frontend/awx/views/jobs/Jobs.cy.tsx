import { UnifiedJob } from '../../interfaces/UnifiedJob';
import * as cancelJobs from './hooks/useCancelJobs';
import * as deleteJobs from './hooks/useDeleteJobs';
import Jobs from './Jobs';

describe('Jobs.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/unified_jobs/*',
        hostname: 'localhost',
      },
      {
        fixture: 'jobs.json',
      }
    );
  });
  it('renders job list', () => {
    cy.mount(<Jobs />);
    cy.hasTitle(/^Jobs$/);
    cy.get('table').find('tr').should('have.length', 11);
  });
  it('deletes job from toolbar menu', () => {
    const spy = cy.spy(deleteJobs, 'useDeleteJobs');
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[0];
        cy.selectTableRow(job.name, false);
        cy.clickToolbarKebabAction(/^Delete selected jobs$/);
        expect(spy).to.be.called;
      });
  });
  it('row action to delete job is disabled if the selected job is running', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[5]; // job with status "running"
        cy.contains('tr', job.id).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('a[data-ouia-component-type="PF4/DropdownItem"]', /^Delete job$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });
  it('row action to delete job  is disabled if the user does not have permissions', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4]; // job with summary_fields.user_capabilities.delete: false
        cy.contains('tr', job.id).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('a[data-ouia-component-type="PF4/DropdownItem"]', /^Delete job$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });
  it('bulk deletion confirmation contains message about selected jobs that cannot be deleted', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4]; // job with summary_fields.user_capabilities.delete: false
        cy.selectToolbarFilterType('ID');
        cy.selectTableRow(job.id.toString(), false);
        cy.clickToolbarKebabAction(/^Delete selected jobs$/);
        cy.contains(
          '1 of the selected jobs cannot be deleted due to insufficient permissions.'
        ).should('be.visible');
      });
  });
  it('row action to cancel job  is disabled if the selected job is not running', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4]; // job with status "successful"
        cy.contains('tr', job.id).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('a[data-ouia-component-type="PF4/DropdownItem"]', /^Cancel job$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });
  it('row action to cancel job  is disabled if the user does not have permissions', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[5]; // job with summary_fields.user_capabilities.start: false
        cy.contains('tr', job.id).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('a[data-ouia-component-type="PF4/DropdownItem"]', /^Cancel job$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });
  it('cancels a running job from row action', () => {
    const spy = cy.spy(cancelJobs, 'useCancelJobs');
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const jobs: UnifiedJob[] = results;
        let job: UnifiedJob;
        if (jobs && jobs.length) {
          job = jobs[3]; // job with status "running"
          cy.mount(<Jobs />);
          cy.contains('tr', job.name).within(() => {
            cy.get('#cancel-job').should('be.visible');
            cy.get('#cancel-job').click();
            expect(spy).to.be.called;
          });
        } else {
          throw new Error('Error retrieving jobs from fixture');
        }
      });
  });
  it('bulk cancellation confirmation contains message about selected jobs that cannot be canceled', () => {
    cy.mount(<Jobs />);
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[0];
        cy.selectToolbarFilterType('ID');
        cy.selectTableRow(job.id.toString(), false);
        cy.clickToolbarKebabAction(/^Cancel selected jobs$/);
        cy.contains(
          '1 of the selected jobs cannot be canceled because they are not running.'
        ).should('be.visible');
      });
  });
});
