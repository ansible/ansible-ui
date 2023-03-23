import { Page } from '@patternfly/react-core';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import * as deleteJobs from './hooks/useDeleteJobs';
import * as cancelJobs from './hooks/useCancelJobs';
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
  it('Component renders', () => {
    cy.mount(
      <Page>
        <Jobs />
      </Page>
    );
    cy.hasTitle(/^Jobs$/);
    cy.get('table').find('tr').should('have.length', 11);
  });
  it('deletes job from toolbar menu', () => {
    const spy = cy.spy(deleteJobs, 'useDeleteJobs');
    cy.mount(
      <Page>
        <Jobs />
      </Page>
    );
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[0];
        cy.selectRow(job.name, false);
        cy.clickToolbarAction(/^Delete selected jobs$/);
        expect(spy).to.be.called;
      });
  });
  it('row action to cancel job  is disabled if the selected job is not running', () => {
    cy.mount(
      <Page>
        <Jobs />
      </Page>
    );
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4];
        cy.contains('tr', job.name).within(() => {
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
    cy.mount(
      <Page>
        <Jobs />
      </Page>
    );
    cy.fixture('jobs.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: UnifiedJob[]) => {
        const job = results[4];
        if (job && job.summary_fields && job.summary_fields.user_capabilities) {
          job.summary_fields.user_capabilities.delete = false;
        }
        cy.contains('tr', job.name).within(() => {
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
          cy.mount(
            <Page>
              <Jobs />
            </Page>
          );
          cy.contains('tr', job.name).within(() => {
            cy.get('button.cancel-job').should('be.visible');
            cy.get('button.cancel-job').click();
            expect(spy).to.be.called;
          });
        } else {
          throw new Error('Error retrieving jobs from fixture');
        }
      });
  });
});
