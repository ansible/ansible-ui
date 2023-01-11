import Jobs from './Jobs';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { ItemsResponse } from '../../../Data';
import * as deleteJobs from './hooks/useDeleteJobs';

describe('Jobs.cy.ts', () => {
  before(() => {
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
    cy.mount(<Jobs />);
    cy.hasTitle(/^Jobs$/);
    cy.get('table').find('tr').should('have.length', 11);
  });
  it('Triggers delete action from toolbar menu', () => {
    const spy = cy.spy(deleteJobs, 'useDeleteJobs');
    cy.mount(<Jobs />);
    cy.fixture('jobs.json').then((response: ItemsResponse<UnifiedJob>) => {
      const job = response.results[0];
      cy.selectRow(job.name, false);
      cy.clickToolbarAction(/^Delete selected jobs$/);
      expect(spy).to.be.called;
    });
  });
});
