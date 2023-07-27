import { useState } from 'react';
import { PageSelectOption, PageSingleSelect } from './PageSingleSelect';

const PageSelectOptions: PageSelectOption<string>[] = [
  {
    label: 'Option1',
    value: 'Option1',
  },
  {
    label: 'Option2',
    value: 'Option2',
  },
];

interface IPageSingleSeletTest {
  placeholder?: string;
  overrideValue?: boolean;
}

const placedholder = 'Select a Value';

function PageSingleSelectTest(props: IPageSingleSeletTest) {
  const [value, setValue] = useState(PageSelectOptions[0].value);
  const { placeholder, overrideValue = false } = props;

  return (
    <>
      <PageSingleSelect
        value={value}
        placeholder={placeholder}
        options={PageSelectOptions}
        onChange={(value) => {
          if (overrideValue) {
            setValue('non-existent');
          } else {
            setValue(value);
          }
        }}
      />
    </>
  );
}

describe('PageSingleSelect', () => {
  describe('no placeholder was not provided', () => {
    beforeEach(() => {
      cy.mount(<PageSingleSelectTest />);
    });

    it('should select an option when clicking on it', () => {
      cy.get('.pf-c-menu-toggle').click();
      cy.get('.pf-c-menu__list-item')
        .eq(1)
        .click()
        .then(() => {
          cy.get('.pf-c-menu-toggle').should('contain.text', PageSelectOptions[1].value);
        });
    });

    it('should display the initial value', () => {
      cy.get('.pf-c-menu-toggle').should('contain.text', PageSelectOptions[0].value);
    });

    it('should show options when clicking on the dropdown toggle', () => {
      cy.get('.pf-c-menu-toggle').click();
      cy.get('.pf-c-menu__list-item').should('have.length', 2);
      cy.get('.pf-c-menu__list-item').eq(0).should('contain', PageSelectOptions[0].value);
      cy.get('.pf-c-menu__list-item').eq(1).should('contain', PageSelectOptions[1].value);
    });
  });

  describe('placeholder was provided', () => {
    beforeEach(() => {
      cy.mount(<PageSingleSelectTest overrideValue placeholder={placedholder} />);
    });

    it('should display placedholder when a non valid value is available', () => {
      cy.get('.pf-c-menu-toggle').click();
      cy.get('.pf-c-menu__list-item')
        .eq(1)
        .click()
        .then(() => {
          cy.get('.pf-c-menu-toggle').should('contain.text', placedholder);
        });
    });
  });
});
