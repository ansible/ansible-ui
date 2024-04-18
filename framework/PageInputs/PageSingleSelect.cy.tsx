/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { ReactNode, useState } from 'react';
import { PageSelectOption } from './PageSelectOption';
import { PageSingleSelect } from './PageSingleSelect';

interface ITestObject {
  name: string;
  description?: string;
}

const testObjects: ITestObject[] = new Array(20).fill(0).map((_, index) => ({
  name: `Option ${index}`,
  description: `Description ${index}`,
}));

const options: PageSelectOption<ITestObject>[] = testObjects.map((testObject) => ({
  value: testObject,
  label: testObject.name,
  description: testObject.description,
}));

const placeholderText = 'Placeholder';

function PageSingleSelectTest<T>(props: {
  placeholder: string;
  defaultValue?: T | null;
  options: PageSelectOption<T>[];
  footer?: ReactNode;
}) {
  const { placeholder, defaultValue, options } = props;
  const [value, setValue] = useState(() => defaultValue);
  return (
    <PageSection>
      <PageSingleSelect
        id="test"
        value={value}
        placeholder={placeholder}
        options={options}
        onSelect={setValue}
        footer={props.footer}
      />
    </PageSection>
  );
}

describe('PageSingleSelect', () => {
  it('should display placedholder', () => {
    cy.mount(<PageSingleSelectTest placeholder={placeholderText} options={options} />);
    cy.singleSelectShouldHaveSelectedOption('#test', placeholderText);
  });

  it('should display the initial value', () => {
    cy.mount(
      <PageSingleSelectTest
        placeholder={placeholderText}
        options={options}
        defaultValue={testObjects[0]}
      />
    );
    cy.singleSelectShouldHaveSelectedOption('#test', testObjects[0].name);
  });

  it('should show options when clicking on the dropdown toggle', () => {
    cy.mount(<PageSingleSelectTest placeholder={placeholderText} options={options} />);
    cy.singleSelectShouldContainOption('#test', testObjects[0].name);
    cy.singleSelectShouldContainOption('#test', testObjects[1].name);
  });

  it('should select an option when clicking on it', () => {
    cy.mount(<PageSingleSelectTest placeholder={placeholderText} options={options} />);
    cy.singleSelectShouldHaveSelectedOption('#test', placeholderText);
    cy.selectSingleSelectOption('#test', testObjects[0].name);
    cy.singleSelectShouldHaveSelectedOption('#test', testObjects[0].name);
    cy.selectSingleSelectOption('#test', testObjects[1].name);
    cy.singleSelectShouldHaveSelectedOption('#test', testObjects[1].name);
  });

  it('should support filtering options when more than 10 items', () => {
    cy.mount(<PageSingleSelectTest placeholder={placeholderText} options={options} />);
    cy.get('#test').click();
    cy.get('#test-search').type('Option 1');
    cy.get('#test-select').should('contain', 'Option 1');
    cy.get('#test-select').should('contain', 'Option 10');
    cy.get('#test-select').should('not.contain', 'Option 2');
  });

  it('should show footer', () => {
    cy.mount(
      <PageSingleSelectTest placeholder={placeholderText} options={options} footer="Footer" />
    );
    cy.get('#test').click();
    cy.contains('Footer');
  });
});
