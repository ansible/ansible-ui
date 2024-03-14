/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { PartialDeep } from 'type-fest';
import {
  asyncSelectTestQuery,
  asyncSelectTestQueryLabel,
} from '../../PageInputs/PageAsyncSingleSelect.cy';
import { PageForm } from '../PageForm';
import {
  PageFormAsyncSingleSelect,
  PageFormAsyncSingleSelectProps,
} from './PageFormAsyncSingleSelect';

interface ITest {
  selected: number;
}

function PageFormAsyncSingleSelectTest(
  props: Omit<PageFormAsyncSingleSelectProps<ITest>, 'placeholder' | 'queryLabel'> & {
    defaultValue?: PartialDeep<ITest>;
  }
) {
  const { defaultValue, ...componentProps } = props;
  return (
    <PageSection>
      <PageForm<ITest> onSubmit={() => Promise.resolve()} defaultValue={defaultValue}>
        <PageFormAsyncSingleSelect<ITest>
          id="test"
          {...componentProps}
          placeholder="Select value"
          queryLabel={asyncSelectTestQueryLabel}
        />
      </PageForm>
    </PageSection>
  );
}

describe('PageFormAsyncSingleSelect', () => {
  it('should show queried options', () => {
    cy.mount(<PageFormAsyncSingleSelectTest name="selected" queryOptions={asyncSelectTestQuery} />);
    cy.get('#test').should('not.have.text', 'Select value');
    cy.get('#test').click();
    cy.get('#test-select').should('contain', 'Option 1');
    cy.get('#test-select').should('contain', 'Option 2');
  });

  it('should show query error', () => {
    cy.mount(
      <PageFormAsyncSingleSelectTest
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
      <PageFormAsyncSingleSelectTest
        name="selected"
        queryOptions={asyncSelectTestQuery}
        defaultValue={{ selected: 2 }}
      />
    );
    cy.get('#test').should('contain', 'Option 2');
  });
});
