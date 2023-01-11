import { IToolbarFilter } from '../../../../../framework';
import { useJobsFilters } from './useJobsFilters';
import 'cypress-react-selector';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TestInner(props: { filters: IToolbarFilter[] }) {
  return <div />;
}

function Test() {
  const jobFilters = useJobsFilters();
  return <TestInner filters={jobFilters} />;
}

describe('useJobsFilters', () => {
  it('Returns expected number of filters', () => {
    cy.mount(<Test />);
    cy.waitForReact();
    cy.getReact('TestInner').getProps('filters').should('have.length', 7);
  });
});
