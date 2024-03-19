/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { useState } from 'react';
import { PageAsyncMultiSelect, PageAsyncMultiSelectProps } from './PageAsyncMultiSelect';
import { asyncSelectTestQuery, asyncSelectTestQueryLabel } from './PageAsyncSingleSelect.cy';

function PageAsyncMultiSelectTest(
  props: Omit<
    PageAsyncMultiSelectProps<number>,
    'values' | 'onSelect' | 'placeholder' | 'queryLabel'
  > & {
    defaultValues?: number[];
  }
) {
  const { defaultValues, ...rest } = props;
  const [values, setValues] = useState<number[] | undefined>(() => defaultValues);
  return (
    <PageSection>
      <PageAsyncMultiSelect<number>
        {...rest}
        id="test"
        values={values}
        onSelect={setValues}
        placeholder="Select value"
        queryLabel={asyncSelectTestQueryLabel}
      />
    </PageSection>
  );
}

describe('PageAsyncMultiSelect', () => {
  it('should show queried options', () => {
    cy.mount(<PageAsyncMultiSelectTest queryOptions={asyncSelectTestQuery} />);
    cy.get('#test').click();
    cy.get('#test-select').should('contain', 'Option 1');
    cy.get('#test-select').should('contain', 'Option 2');
  });

  it('should show query error', () => {
    cy.mount(
      <PageAsyncMultiSelectTest
        queryOptions={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          throw new Error();
        }}
      />
    );
    cy.get('#test').click();
    cy.get('#test').should('contain', 'Error loading options');
  });

  it('should show initial values', () => {
    cy.mount(
      <PageAsyncMultiSelectTest queryOptions={asyncSelectTestQuery} defaultValues={[1, 2]} />
    );
    cy.get('#test').should('contain', 'Option 1');
    cy.get('#test').should('contain', 'Option 2');
  });
});
