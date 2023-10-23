/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { ReactNode, useState } from 'react';
import { PageMultiSelect } from './PageMultiSelect';
import { PageSelectOption } from './PageSelectOption';

interface ITestObject {
  name: string;
  description?: string;
}

const testObjects: ITestObject[] = new Array(12).fill(0).map((_, index) => ({
  name: `Option ${index}`,
  description: `Description ${index}`,
}));

const options: PageSelectOption<ITestObject>[] = testObjects.map((testObject) => ({
  label: testObject.name,
  value: testObject,
  description: testObject.description,
}));

const placeholderText = 'Placeholder';

function PageMultiSelectTest<T>(props: {
  placeholder?: string;
  defaultValues?: T[];
  options: PageSelectOption<T>[];
  footer?: ReactNode;
}) {
  const { placeholder, defaultValues: defaultValue, options, footer } = props;
  const [values, setValues] = useState<T[] | undefined>(() => defaultValue);
  return (
    <PageSection>
      <PageMultiSelect
        id="test"
        values={values}
        placeholder={placeholder}
        options={options}
        onSelect={setValues}
        footer={footer}
      />
    </PageSection>
  );
}

describe('PageMultiSelect', () => {
  it('should show placeholder', () => {
    cy.mount(<PageMultiSelectTest placeholder={placeholderText} options={options} />);
    cy.get('#test').should('have.text', placeholderText);
  });

  it('should show initial value', () => {
    cy.mount(
      <PageMultiSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValues={testObjects}
      />
    );
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[1].name);
  });

  it('select and unselect options', () => {
    cy.mount(<PageMultiSelectTest placeholder={placeholderText} options={options} />);
    cy.get('#test').should('have.text', placeholderText);

    cy.multiSelectShouldNotHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldNotHaveSelectedOption('#test', testObjects[1].name);

    cy.get('#test').click();

    cy.selectMultiSelectOption('#test', testObjects[0].name);
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldNotHaveSelectedOption('#test', testObjects[1].name);

    cy.selectMultiSelectOption('#test', testObjects[1].name);
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[1].name);

    cy.selectMultiSelectOption('#test', testObjects[0].name);
    cy.multiSelectShouldNotHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[1].name);

    cy.selectMultiSelectOption('#test', testObjects[1].name);
    cy.multiSelectShouldNotHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldNotHaveSelectedOption('#test', testObjects[1].name);

    cy.get('#test').click();

    cy.get('#test').should('have.text', placeholderText);
  });

  it('should support filtering options when more than 10 items', () => {
    cy.mount(<PageMultiSelectTest placeholder={placeholderText} options={options} />);
    cy.get('#test').click();
    cy.get('#test-search').type('Option 1');
    cy.get('#test-select').should('contain', 'Option 1');
    cy.get('#test-select').should('contain', 'Option 10');
    cy.get('#test-select').should('not.contain', 'Option 2');
  });

  it('should show footer', () => {
    cy.mount(
      <PageMultiSelectTest placeholder={placeholderText} options={options} footer="Footer" />
    );
    cy.get('#test').click();
    cy.contains('Footer');
  });
});
