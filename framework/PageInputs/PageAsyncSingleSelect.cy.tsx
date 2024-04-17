/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { ReactNode, useState } from 'react';
import { PageAsyncSelectQueryOptions, PageAsyncSelectQueryResult } from './PageAsyncSelectOptions';
import { PageAsyncSingleSelect, PageAsyncSingleSelectProps } from './PageAsyncSingleSelect';

export const asyncSelectTestOptions = new Array(50).fill(0).map((_, index) => ({
  value: index + 1,
  label: `Option ${index + 1}`,
  description: `Description ${index + 1}`,
}));

export function asyncSelectTestQuery(
  queryOptions: PageAsyncSelectQueryOptions
): Promise<PageAsyncSelectQueryResult<number>> {
  const pageSize = 10;
  const searchedOptions = asyncSelectTestOptions.filter((option) => {
    if (!queryOptions.search) return true;
    return option.label.includes(queryOptions.search);
  });
  const page = queryOptions.next ? Number(queryOptions.next) : 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const options = searchedOptions.slice(start, end);
  return Promise.resolve({
    options,
    remaining: searchedOptions.length - end,
    next: page + 1,
  });
}

export function asyncSelectTestQueryLabel(value: number): ReactNode {
  return `Option ${value}`;
}

function PageAsyncSingleSelectTest(
  props: Omit<
    PageAsyncSingleSelectProps<number>,
    'value' | 'onSelect' | 'placeholder' | 'queryLabel'
  > & {
    defaultValue?: number;
  }
) {
  const { defaultValue, ...rest } = props;
  const [value, setValue] = useState<number | undefined | null>(() => defaultValue);
  return (
    <PageSection>
      <PageAsyncSingleSelect<number>
        {...rest}
        id="test"
        value={value}
        onSelect={setValue}
        placeholder="Select value"
        queryLabel={asyncSelectTestQueryLabel}
      />
    </PageSection>
  );
}

describe('PageAsyncSingleSelect', () => {
  it('should show queried options', () => {
    cy.mount(<PageAsyncSingleSelectTest queryOptions={asyncSelectTestQuery} />);
    cy.get('#test').should('to.have.text', 'Select value');
    cy.singleSelectShouldContainOption('#test', 'Option 1');
    cy.singleSelectShouldContainOption('#test', 'Option 2');
  });

  it('should show query error', () => {
    cy.mount(
      <PageAsyncSingleSelectTest
        queryOptions={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          throw new Error();
        }}
      />
    );
    cy.get('#test').click();
    cy.get('#test').should('have.text', 'Error loading options');
  });

  it('should show initial value', () => {
    cy.mount(<PageAsyncSingleSelectTest queryOptions={asyncSelectTestQuery} defaultValue={1} />);
    cy.singleSelectShouldHaveSelectedOption('#test', 'Option 1');
  });

  it('should show initial value even if option is not in first queried result', () => {
    cy.mount(<PageAsyncSingleSelectTest queryOptions={asyncSelectTestQuery} defaultValue={11} />);
    cy.singleSelectShouldHaveSelectedOption('#test', 'Option 11');
  });
});
