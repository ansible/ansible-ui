/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { useState } from 'react';
import { PageAsyncSelectQueryOptions, PageAsyncSelectQueryResult } from './PageAsyncSelectOptions';
import { PageAsyncSingleSelect, PageAsyncSingleSelectProps } from './PageAsyncSingleSelect';

const testOptions = new Array(50).fill(0).map((_, index) => ({
  value: index + 1,
  label: `Option ${index + 1}`,
  description: `Description ${index + 1}`,
}));

function queryOptions(queryOptions: PageAsyncSelectQueryOptions) {
  const pageSize = 10;
  const searchedOptions = testOptions.filter((option) => {
    if (!queryOptions.search) return true;
    return option.label.includes(queryOptions.search);
  });
  const page = queryOptions.next ? Number(queryOptions.next) : 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const options = searchedOptions.slice(start, end);
  return Promise.resolve({ total: searchedOptions.length, options });
}

const placeholderText = 'Placeholder';

function PageAsyncSingleSelectTest<T>(
  props: Omit<PageAsyncSingleSelectProps<T>, 'value' | 'onSelect'> & { defaultValue?: T }
) {
  const { defaultValue, ...rest } = props;
  const [value, setValue] = useState<T | undefined>(() => defaultValue);
  return (
    <PageSection>
      <PageAsyncSingleSelect {...rest} id="test" value={value} onSelect={setValue} />
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

  it.skip('should show initial value even if option is not in first queried result', () => {
    cy.mount(
      <PageAsyncSingleSelectTest
        placeholder={placeholderText}
        queryOptions={queryOptions}
        defaultValue={11}
      />
    );
    cy.singleSelectShouldHaveSelectedOption('#test', 'Option 11');
  });

  it.only('should handle searched options from query', () => {
    cy.mount(
      <PageAsyncSingleSelectTest placeholder={placeholderText} queryOptions={queryOptions} />
    );
    cy.singleSelectShouldHaveSelectedOption('#test', 'Option 1');
  });
});
