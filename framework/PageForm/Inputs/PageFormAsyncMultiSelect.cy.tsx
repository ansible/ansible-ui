/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { PartialDeep } from 'type-fest';
import { PageAsyncSelectQueryResult } from '../../PageInputs/PageAsyncSelectOptions';
import {
  asyncSelectTestQuery,
  asyncSelectTestQueryLabel,
} from '../../PageInputs/PageAsyncSingleSelect.cy';
import { PageForm } from '../PageForm';
import {
  PageFormAsyncMultiSelect,
  PageFormAsyncMultiSelectProps,
} from './PageFormAsyncMultiSelect';

interface ITest {
  selected: number[];
}

function PageFormAsyncMultiSelectTest(
  props: Omit<PageFormAsyncMultiSelectProps<ITest>, 'placeholder' | 'queryLabel'> & {
    defaultValue?: PartialDeep<ITest>;
  }
) {
  const { defaultValue, ...componentProps } = props;
  return (
    <PageSection>
      <PageForm<ITest> onSubmit={() => Promise.resolve()} defaultValue={defaultValue}>
        <PageFormAsyncMultiSelect<ITest>
          id="test"
          {...componentProps}
          placeholder="Select value"
          queryLabel={asyncSelectTestQueryLabel}
        />
      </PageForm>
    </PageSection>
  );
}

describe('PageFormAsyncMultiSelect', () => {
  it('should show loading options state', () => {
    let optionsResolve: (result: PageAsyncSelectQueryResult<number>) => void = () => null;
    const optionPromise = new Promise<PageAsyncSelectQueryResult<number>>(
      (r) => (optionsResolve = r)
    );
    cy.mount(
      <PageFormAsyncMultiSelectTest
        name="selected"
        queryOptions={async () => await optionPromise}
      />
    );
    cy.get('#test')
      .should('have.text', 'Loading options...')
      .then(() => optionsResolve({ remaining: 0, options: [], next: 0 }));
  });

  it('should show queried options', () => {
    cy.mount(<PageFormAsyncMultiSelectTest name="selected" queryOptions={asyncSelectTestQuery} />);
    cy.get('#test').should('not.have.text', 'Loading options...');
    cy.get('#test').click();
    cy.get('#test-select').should('contain', 'Option 1');
    cy.get('#test-select').should('contain', 'Option 2');
  });

  it('should show query error', () => {
    cy.mount(
      <PageFormAsyncMultiSelectTest
        name="selected"
        queryOptions={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          throw new Error();
        }}
      />
    );
    cy.get('#test').should('contain', 'Error loading options');
  });

  it('should show initial value', () => {
    cy.mount(
      <PageFormAsyncMultiSelectTest
        name="selected"
        queryOptions={asyncSelectTestQuery}
        defaultValue={{ selected: [1, 2] }}
      />
    );
    cy.get('#test').should('contain', 'Option 1');
    cy.get('#test').should('contain', 'Option 2');
  });
});
