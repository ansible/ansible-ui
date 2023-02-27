import { IToolbarFilter } from '../../../../../framework';
import { useJobsFilters } from './useJobsFilters';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TestInner(props: { filters: IToolbarFilter[] }) {
  return <div />;
}

function Test() {
  const jobFilters = useJobsFilters();
  return (
    <div id="root">
      <TestInner filters={jobFilters} />
    </div>
  );
}

describe('useJobsFilters', () => {
  it('Returns expected number of filters', () => {
    cy.mount(<Test />);
    cy.waitForReact(10000, '#root');
    cy.getReact('TestInner').getProps('filters').should('have.length', 7);
  });
});
