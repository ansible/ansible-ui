/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { useState } from 'react';
import { PageAsyncMultiSelect, PageAsyncMultiSelectQueryResult } from './PageAsyncMultiSelect';

const queryOptions = async (page: number, _signal: AbortSignal) => {
  const pageSize = 10;
  await new Promise((resolve) => setTimeout(resolve, 0));
  return {
    total: 100,
    options: new Array(pageSize).fill(0).map((_, index) => {
      const value = index + (page - 1) * pageSize + 1;
      return {
        value: value,
        label: `Option ${value}`,
        description: `Description ${value}`,
      };
    }),
  };
};

const placeholderText = 'Placeholder';

function PageAsyncMultiSelectTest<T>(props: {
  placeholder?: string;
  defaultValues?: T[];
  queryOptions: (page: number, signal: AbortSignal) => Promise<PageAsyncMultiSelectQueryResult<T>>;
}) {
  const { placeholder, defaultValues, queryOptions } = props;
  const [values, setValues] = useState<T[] | undefined>(() => defaultValues);
  return (
    <PageSection>
      <PageAsyncMultiSelect
        id="test"
        values={values}
        placeholder={placeholder}
        onSelect={setValues}
        queryOptions={queryOptions}
      />
    </PageSection>
  );
}

describe('PageAsyncMultiSelect', () => {
  it('should show loading options state', () => {
    let optionsResolve: (result: PageAsyncMultiSelectQueryResult<number>) => void = () => null;
    const optionPromise = new Promise<PageAsyncMultiSelectQueryResult<number>>(
      (r) => (optionsResolve = r)
    );
    cy.mount(
      <PageAsyncMultiSelectTest
        placeholder={placeholderText}
        queryOptions={async () => await optionPromise}
      />
    );
    cy.get('#test')
      .should('have.text', 'Loading options...')
      .then(() => optionsResolve({ total: 0, options: [] }));
  });

  it('should show queried options', () => {
    cy.mount(
      <PageAsyncMultiSelectTest placeholder={placeholderText} queryOptions={queryOptions} />
    );
    cy.get('#test').should('not.have.text', 'Loading options...');
    cy.singleSelectShouldContainOption('#test', 'Option 1');
    cy.singleSelectShouldContainOption('#test', 'Option 2');
  });

  it('should show query error', () => {
    cy.mount(
      <PageAsyncMultiSelectTest
        placeholder={placeholderText}
        queryOptions={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          throw new Error();
        }}
      />
    );
    cy.get('#test').should('have.text', 'Error loading options');
  });

  it('should show initial value', () => {
    cy.mount(
      <PageAsyncMultiSelectTest
        placeholder={placeholderText}
        queryOptions={queryOptions}
        defaultValues={[1, 2]}
      />
    );
    cy.multiSelectShouldHaveSelectedOption('#test', 'Option 1');
    cy.multiSelectShouldHaveSelectedOption('#test', 'Option 2');
  });
});
