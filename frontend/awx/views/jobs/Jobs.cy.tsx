import { Page } from '@patternfly/react-core';
import { MemoryRouter } from 'react-router';
import { ItemsResponse } from '../../../common/crud/Data';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
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
  it('Component renders', () => {
    cy.mount(
      <MemoryRouter>
        <Page>
          <Jobs />
        </Page>
      </MemoryRouter>
    );
    cy.hasTitle(/^Jobs$/);
    cy.get('table').find('tr').should('have.length', 11);
  });
  it('Triggers delete action from toolbar menu', () => {
    const spy = cy.spy(deleteJobs, 'useDeleteJobs');
    cy.mount(
      <MemoryRouter>
        <Page>
          <Jobs />
        </Page>
      </MemoryRouter>
    );
    cy.fixture('jobs.json').then((response: ItemsResponse<UnifiedJob>) => {
      const job = response.results[0];
      cy.selectRow(job.name, false);
      cy.clickToolbarAction(/^Delete selected jobs$/);
      expect(spy).to.be.called;
    });
  });
});
