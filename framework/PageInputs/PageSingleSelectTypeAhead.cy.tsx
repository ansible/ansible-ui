/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';
import { PageSelectOption } from './PageSelectOption';
import { PageSingleSelectTypeAhead } from './PageSingleSelectTypeAhead';

interface ITestObject {
  name: string;
  description?: string;
  label?: string;
}

const testObjects: ITestObject[] = new Array(4).fill(0).map((_, index) => ({
  name: `Option ${index}`,
  description: `Description ${index}`,
}));

const options: PageSelectOption<ITestObject>[] = testObjects.map((testObject) => ({
  value: testObject,
  label: testObject.name,
  description: testObject.description,
}));

const placeholderText = 'Placeholder';
const NonExistentOption = 'Non existent option';
const NotFoundResult = 'No results found';

function PageSingleSelectTypeAheadTest<T>(props: {
  placeholder: string;
  defaultValue?: T;
  options: PageSelectOption<T>[];
}) {
  const { placeholder, defaultValue, options } = props;
  const [value, setValue] = useState(() => defaultValue);
  return (
    <PageSingleSelectTypeAhead
      id="test-single-select"
      value={value}
      placeholder={placeholder}
      options={options}
      onSelect={setValue}
    />
  );
}

describe('PageSingleSelectTypeAhead', () => {
  beforeEach(() => {
    cy.mount(<PageSingleSelectTypeAheadTest placeholder={placeholderText} options={options} />);
  });

  it('should filter options when typing', () => {
    cy.get('#test-single-select').click();
    cy.get('input').type(NonExistentOption);
    cy.get('.pf-c-menu__content').should('contain.text', NotFoundResult);
    cy.get('input').clear().type('1');
    cy.get('.pf-c-menu__content').should('contain.text', 'Option 1').click();
    cy.selectSingleSelectOption('#test-single-select', 'Option 1');
  });
});
