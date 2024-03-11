/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { useState } from 'react';
import { PageAsyncSelectQueryResult } from './PageAsyncSelectOptions';
import { PageAsyncSingleSelect } from './PageAsyncSingleSelect';

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

function PageAsyncSingleSelectTest<T>(props: {
  placeholder: string;
  defaultValue?: T;
  queryOptions: (page: number, signal: AbortSignal) => Promise<PageAsyncSelectQueryResult<T>>;
}) {
  const { placeholder, defaultValue: defaultValues, queryOptions } = props;
  const [value, setValue] = useState<T | undefined>(() => defaultValues);
  return (
    <PageSection>
      <PageAsyncSingleSelect
        id="test"
        value={value}
        placeholder={placeholder}
        onSelect={setValue}
        queryOptions={queryOptions}
      />
    </PageSection>
  );
}

describe('PageAsyncSingleSelect', () => {
  it('should show loading options state', () => {
    let optionsResolve: (result: PageAsyncSelectQueryResult<number>) => void = () => null;
    const optionPromise = new Promise<PageAsyncSelectQueryResult<number>>(
      (r) => (optionsResolve = r)
    );
    cy.mount(
      <PageAsyncSingleSelectTest
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
      <PageAsyncSingleSelectTest placeholder={placeholderText} queryOptions={queryOptions} />
    );
    cy.get('#test').should('not.have.text', 'Loading options...');
    cy.singleSelectShouldContainOption('#test', 'Option 1');
    cy.singleSelectShouldContainOption('#test', 'Option 2');
  });

  it('should show query error', () => {
    cy.mount(
      <PageAsyncSingleSelectTest
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
      <PageAsyncSingleSelectTest
        placeholder={placeholderText}
        queryOptions={queryOptions}
        defaultValue={1}
      />
    );
    cy.singleSelectShouldHaveSelectedOption('#test', 'Option 1');
  });
});
