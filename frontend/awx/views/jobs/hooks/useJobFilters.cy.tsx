import { IToolbarFilter } from '../../../../../framework';
import { useJobsFilters } from './useJobsFilters';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TestInner(props: { filters: IToolbarFilter[] }) {
  return <div />;
}

before(() => {
  cy.intercept('OPTIONS', '/api/v2/unified_jobs/', { fixture: 'mock_options.json' }).as(
    'getOptions'
  );
});

function Test() {
  const jobFilters = useJobsFilters();
  return (
    jobFilters &&
    jobFilters.length > 0 && (
      <div id="root">
        <TestInner filters={jobFilters} />
      </div>
    )
  );
}

describe('useJobsFilters', () => {
  it('Returns expected number of filters', () => {
    cy.mount(<Test />);
    cy.wait('@getOptions');
    cy.waitForReact(10000, '#root');
    cy.getReact('TestInner').getProps('filters').should('have.length', 24);
  });
});
