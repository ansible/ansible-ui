/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';
import { PageMultiSelect } from './PageMultiSelect';
import { PageSelectOption } from './PageSelectOption';

interface ITestObject {
  name: string;
  description?: string;
}

const testObjects: ITestObject[] = new Array(2).fill(0).map((_, index) => ({
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
}) {
  const { placeholder, defaultValues: defaultValue, options } = props;
  const [values, setValues] = useState<T[] | undefined>(() => defaultValue);
  return (
    <PageMultiSelect
      id="test"
      values={values}
      placeholder={placeholder}
      options={options}
      onSelect={setValues}
    />
  );
}

describe('PageMultiSelect', () => {
  it('should show placeholder', () => {
    cy.mount(<PageMultiSelectTest placeholder="Placeholder" options={options} />);
    cy.get('#test').should('have.text', placeholderText);
  });

  it('should show initial value', () => {
    cy.mount(
      <PageMultiSelectTest
        placeholder="Placeholder"
        options={options}
        defaultValues={testObjects}
      />
    );
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[0].name);
    cy.multiSelectShouldHaveSelectedOption('#test', testObjects[1].name);
  });

  it('select and unselect options', () => {
    cy.mount(<PageMultiSelectTest placeholder="Placeholder" options={options} />);
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

  it('should support string options', () => {
    const options = ['abc', 'def'];
    cy.mount(
      <PageMultiSelectTest placeholder="Placeholder" options={options} defaultValues={options} />
    );
    cy.multiSelectShouldHaveSelectedOption('#test', options[0]);
    cy.multiSelectShouldHaveSelectedOption('#test', options[1]);
  });

  it('should support number options', () => {
    const options = [1, 2];
    cy.mount(
      <PageMultiSelectTest placeholder="Placeholder" options={options} defaultValues={options} />
    );
    cy.multiSelectShouldHaveSelectedOption('#test', options[0].toString());
    cy.multiSelectShouldHaveSelectedOption('#test', options[1].toString());
  });
});
