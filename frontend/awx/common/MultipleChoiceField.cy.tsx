/* eslint-disable i18next/no-literal-string */

import { AwxPageForm } from './AwxPageForm';
import { MultipleChoiceField } from './MultipleChoiceField';

describe('MultipleChoiceField', () => {
  describe('Multiple Choice - single select', () => {
    const defaultValue = {
      formattedChoices: [
        { name: 'choice 1', default: true },
        { name: 'choice 2', default: false },
        { name: 'choice 3', default: false },
      ],
    };

    beforeEach(() => {
      cy.mount(
        <AwxPageForm
          singleColumn
          submitText={'Create'}
          onSubmit={async () => {}}
          defaultValue={defaultValue}
        >
          <MultipleChoiceField type={'multiplechoice'} />
        </AwxPageForm>
      );
    });

    it('should render component and display documentation tooltip', () => {
      cy.get('[data-cy="multiple-choice-options-form-group"]').find('button').first().click();

      cy.contains('Refer to the documentation for more information.');
      cy.get('[aria-label="Close"]').click();
      cy.contains('Refer to the documentation for more information.').should('not.exist');
    });

    it('should let user add, update and remove options', () => {
      defaultValue.formattedChoices.forEach((choice, index) => {
        cy.getByDataCy(`choice-option-${index}`).should('exist').and('have.value', choice.name);
        cy.getByDataCy(`remove-choice-${index}`).should('exist');
      });

      // add
      cy.getByDataCy('add-choice-input').type('foo');
      cy.get('[data-cy="add-choice"]').should('not.be.disabled').click();
      cy.getByDataCy('choice-option-3').should('have.value', 'foo');
      cy.getByDataCy('add-choice-input').should('have.value', '');

      // remove
      cy.getByDataCy('remove-choice-0').click();
      cy.getByDataCy('choice-option-0').should('have.value', 'choice 2');
      cy.getByDataCy('choice-option-1').should('have.value', 'choice 3');
      cy.getByDataCy('choice-option-2').should('have.value', 'foo');

      // update
      cy.getByDataCy('choice-option-2').clear().type('foobar', { force: true });
      cy.getByDataCy('choice-option-2').should('have.value', 'foobar');
    });

    it('should let user select only single default option', () => {
      defaultValue.formattedChoices.forEach((_, index) => {
        cy.getByDataCy(`choice-radio-${index}`).parent().contains('Default option');
      });

      cy.getByDataCy('choice-radio-2').check({ force: true });
      cy.getByDataCy('choice-radio-0').should('have.value', 'false');
      cy.getByDataCy('choice-radio-1').should('have.value', 'false');
      cy.getByDataCy('choice-radio-2').should('have.value', 'true');

      cy.getByDataCy('choice-radio-2').click({ force: true });
      cy.getByDataCy('choice-radio-0').should('have.value', 'false');
      cy.getByDataCy('choice-radio-1').should('have.value', 'false');
      cy.getByDataCy('choice-radio-2').should('have.value', 'false');
    });

    it('should display errors if component is not valid', () => {
      cy.getByDataCy('choice-option-0').clear();
      cy.getByDataCy('choice-option-0').type('{enter}', { force: true });
      cy.get('[data-cy="choice-radio-0"]').should('be.disabled');
      cy.contains('Choice option cannot be empty.');
    });
  });

  describe('Multiple Choice - multiple select', () => {
    const defaultValue = {
      formattedChoices: [
        { name: 'choice 1', default: true },
        { name: 'choice 2', default: false },
        { name: 'choice 3', default: true },
      ],
    };

    beforeEach(() => {
      cy.mount(
        <AwxPageForm
          singleColumn
          submitText={'Create'}
          onSubmit={async () => {}}
          defaultValue={defaultValue}
        >
          <MultipleChoiceField type={'multiselect'} />
        </AwxPageForm>
      );
    });

    it('should let user add, update and remove options', () => {
      defaultValue.formattedChoices.forEach((choice, index) => {
        cy.getByDataCy(`choice-option-${index}`).should('have.value', choice.name);
        cy.getByDataCy(`remove-choice-${index}`).should('exist');
        cy.getByDataCy(`choice-checkbox-${index}`).should('have.value', String(choice.default));
      });

      cy.getByDataCy('choice-checkbox-1').check({ force: true });

      defaultValue.formattedChoices.forEach((_, index) => {
        cy.getByDataCy(`choice-checkbox-${index}`).should('have.attr', 'checked');
      });

      cy.getByDataCy('add-choice-input').type('foo');
      cy.getByDataCy('add-choice').click();

      cy.getByDataCy('choice-option-3').should('have.value', 'foo');
      cy.getByDataCy('choice-checkbox-3').should('have.value', 'false');

      cy.getByDataCy('choice-checkbox-3').click({ force: true });
      cy.getByDataCy('choice-checkbox-3').should('have.value', 'true');

      cy.getByDataCy('choice-checkbox-3').click({ force: true });
      cy.getByDataCy('choice-checkbox-3').should('have.value', 'false');

      cy.getByDataCy('choice-option-3').clear();
      cy.get('[data-cy="choice-checkbox-3"]').should('be.disabled');

      cy.getByDataCy('remove-choice-3').click();
      cy.get('[data-cy="choice-option-3"]').should('not.exist');
    });
  });
});
