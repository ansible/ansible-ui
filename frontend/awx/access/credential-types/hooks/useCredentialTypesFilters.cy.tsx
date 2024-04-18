import { IToolbarFilter } from '../../../../../framework';
import { useCredentialTypesFilters } from './useCredentialTypesFilters';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TestInner(props: { filters: IToolbarFilter[] }) {
  return <div />;
}

before(() => {
  cy.intercept('OPTIONS', '/api/v2/credential_types', { fixture: 'mock_options.json' }).as(
    'getOptions'
  );
});

function Test() {
  const credentialTypeFilters = useCredentialTypesFilters();
  return (
    credentialTypeFilters &&
    credentialTypeFilters.length > 0 && (
      <div id="root">
        <TestInner filters={credentialTypeFilters} />
      </div>
    )
  );
}

describe('useCredentialTypesFilters', () => {
  it('Returns expected number of filters', () => {
    cy.mount(<Test />);
    cy.wait('@getOptions');
    cy.waitForReact(10000, '#root');
    cy.getReact('TestInner').getProps('filters').should('have.length', 26);
  });
});
