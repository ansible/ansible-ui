/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { useState } from 'react';
import { PageAsyncMultiSelect } from './PageAsyncMultiSelect';
import { IPageSelectOption } from './PageSelectOption';

interface ITestObject {
  name: string;
  description?: string;
}

const testObjects: ITestObject[] = new Array(2).fill(0).map((_, index) => ({
  name: `Option ${index}`,
  description: `Description ${index}`,
}));

const options: IPageSelectOption<ITestObject>[] = testObjects.map((testObject) => ({
  label: testObject.name,
  value: testObject,
  description: testObject.description,
}));

const queryOptions = async (_signal: AbortSignal) => {
  await new Promise((resolve) => setTimeout(resolve, 1));
  return options;
};

const placeholderText = 'Placeholder';

function PageAsyncMultiSelectTest<T>(props: {
  placeholder?: string;
  defaultValues?: T[];
  queryOptions: (signal: AbortSignal) => Promise<IPageSelectOption<T>[]>;
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
        openSelectDialog={() => alert('openSelectDialog')}
      />
    </PageSection>
  );
}

describe('PageAsyncMultiSelect', () => {
  it('should show loading options state', () => {
    let optionsResolve: (options: IPageSelectOption<ITestObject>[]) => void = () => null;
    const optionPromise = new Promise<IPageSelectOption<ITestObject>[]>(
      (r) => (optionsResolve = r)
    );
    cy.mount(
      <PageAsyncMultiSelectTest
        placeholder={placeholderText}
        queryOptions={async () => await optionPromise}
      />
    );
    cy.get('#test').should('have.text', 'Loading options...');
    optionsResolve([]);
  });

  it('should show queried options', () => {
    cy.mount(
      <PageAsyncMultiSelectTest placeholder={placeholderText} queryOptions={queryOptions} />
    );
    cy.singleSelectShouldContainOption('#test', testObjects[0].name);
    cy.singleSelectShouldContainOption('#test', testObjects[1].name);
  });

  it('should show query error', () => {
    cy.mount(
      <PageAsyncMultiSelectTest
        placeholder={placeholderText}
        queryOptions={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          throw new Error();
        }}
        defaultValues={testObjects}
      />
    );
    cy.get('#test').should('have.text', 'Error loading options');
  });

  it('should show initial value', () => {
    cy.mount(
      <PageAsyncMultiSelectTest
        placeholder={placeholderText}
        queryOptions={queryOptions}
        defaultValues={testObjects}
      />
    );
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[1].name);
  });
});
