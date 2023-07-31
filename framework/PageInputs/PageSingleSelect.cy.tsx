/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';
import { PageSelectOption, PageSingleSelect } from './PageSingleSelect';

interface ITestObject {
  name: string;
  description?: string;
}

const testObjects: ITestObject[] = [
  { name: 'Option 1', description: 'Description 1' },
  { name: 'Option 2', description: 'Description 2' },
];

const options: PageSelectOption<ITestObject>[] = testObjects.map((testObject) => ({
  label: testObject.name,
  value: testObject,
  description: testObject.description,
}));

const placeholderText = 'Placeholder';

function PageSingleSelectTest<T>(props: {
  placeholder?: string;
  defaultValue?: T;
  options: PageSelectOption<T>[];
}) {
  const { placeholder, defaultValue, options } = props;
  const [value, setValue] = useState(() => defaultValue);
  return (
    <PageSingleSelect
      id="test-single-select"
      value={value}
      placeholder={placeholder}
      options={options}
      onChange={setValue}
    />
  );
}

describe('PageSingleSelect', () => {
  it('should display placedholder', () => {
    cy.mount(<PageSingleSelectTest placeholder="Placeholder" options={options} />);
    cy.singleSelectShouldHaveSelectedOption('#test-single-select', placeholderText);
  });

  it('should display the initial value', () => {
    cy.mount(
      <PageSingleSelectTest
        placeholder="Placeholder"
        options={options}
        defaultValue={options[0].value}
      />
    );
    cy.singleSelectShouldHaveSelectedOption('#test-single-select', options[0].label);
  });

  it('should show options when clicking on the dropdown toggle', () => {
    cy.mount(<PageSingleSelectTest placeholder="Placeholder" options={options} />);
    cy.singleSelectShouldContainOption('#test-single-select', options[0].label);
    cy.singleSelectShouldContainOption('#test-single-select', options[1].label);
  });

  it('should select an option when clicking on it', () => {
    cy.mount(<PageSingleSelectTest placeholder="Placeholder" options={options} />);
    cy.singleSelectShouldHaveSelectedOption('#test-single-select', placeholderText);
    cy.selectSingleSelectOption('#test-single-select', options[0].label);
    cy.singleSelectShouldHaveSelectedOption('#test-single-select', options[0].label);
    cy.selectSingleSelectOption('#test-single-select', options[1].label);
    cy.singleSelectShouldHaveSelectedOption('#test-single-select', options[1].label);
  });
});
