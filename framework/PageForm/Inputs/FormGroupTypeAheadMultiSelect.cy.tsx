/* eslint-disable i18next/no-literal-string */
import {
  FormGroupTypeAheadMultiSelect,
  FormGroupTypeAheadMultiSelectProps,
} from './FormGroupTypeAheadMultiSelect';

describe('FormGroupTypeAheadMultiSelect Component', () => {
  const defaultProps: FormGroupTypeAheadMultiSelectProps = {
    label: 'Select Teams',
    options: [
      { value: 'team1', label: 'Team 1' },
      { value: 'team2', label: 'Team 2' },
      { value: 'team3', label: 'Team 3' },
    ],
    isSubmitting: false,
    value: [],
    placeholderText: 'Type to search...',
    onHandleSelection: () => {},
    onHandleClear: () => {},
  };

  // Create a helper function to mount the component with overridden props
  const mountComponent = (props?: Partial<FormGroupTypeAheadMultiSelectProps>) => {
    // Ensure that required props are always present by spreading defaultProps first
    const combinedProps: FormGroupTypeAheadMultiSelectProps = {
      ...defaultProps,
      ...props,
    };
    cy.mount(<FormGroupTypeAheadMultiSelect {...combinedProps} />);
  };

  describe('Default Rendering', () => {
    it('renders correctly with default props', () => {
      mountComponent();

      // Check if the label is rendered
      cy.contains('label', 'Select Teams').should('be.visible');

      // Check if the Select input is rendered with the correct placeholder
      cy.get('input').should('be.visible').and('have.attr', 'placeholder', 'Type to search...');

      // Check if no chips are rendered initially
      cy.get('.pf-c-chip').should('not.exist');
    });

    it('renders with placeholder text when no value is selected', () => {
      mountComponent({
        placeholderText: 'Choose teams...',
      });

      cy.get('input').should('have.attr', 'placeholder', 'Choose teams...');
    });
  });

  describe('State-Based Rendering', () => {
    it('disables the Select input when isReadOnly is true', () => {
      mountComponent({
        isReadOnly: true,
      });

      cy.get('input').should('be.disabled');
    });

    it('disables the Select input when isSubmitting is true', () => {
      mountComponent({
        isSubmitting: true,
      });

      cy.get('input').should('be.disabled');
    });
  });

  describe('Helper Text and Validation', () => {
    it('shows helper text when provided', () => {
      mountComponent({
        helperText: 'Select one or more teams.',
      });

      cy.contains('Select one or more teams.').should('be.visible');
    });

    it('shows invalid helper text when helperTextInvalid is provided', () => {
      mountComponent({
        helperTextInvalid: 'This field is required.',
      });

      cy.contains('This field is required.').should('be.visible');
    });

    it('handles required field indication', () => {
      mountComponent({
        isRequired: true,
      });

      cy.contains('label', 'Select Teams').find('span').contains('*').should('be.visible');
    });
  });

  describe('Additional Controls and Label Help', () => {
    it('renders additional controls when provided', () => {
      const AdditionalControl = () => <button data-cy="additional-control">Extra</button>;
      mountComponent({
        additionalControls: <AdditionalControl />,
      });

      cy.get('[data-cy="additional-control"]').should('be.visible');
    });
  });

  describe('Label dropdown', () => {
    const options = Array.from({ length: 50 }, (_, i) => ({
      value: `Option ${i + 1}`,
      label: `Option ${i + 1}`,
    }));
    const defaultProps: FormGroupTypeAheadMultiSelectProps = {
      label: 'Select labels',
      options: options,
      isSubmitting: false,
      value: [],
      placeholderText: 'Type to search...',
      onHandleSelection: () => {},
      onHandleClear: () => {},
    };
    it('renders a scrollable labels dropdown', () => {
      cy.mount(<FormGroupTypeAheadMultiSelect {...defaultProps} />);
      cy.get('input').click();

      cy.get('[data-cy="select-option-Option 1"]').contains('Option 1').should('be.visible');
      cy.get('[data-cy="select-option-Option 50"]').contains('Option 50').should('not.be.visible');

      cy.get('[data-cy="select-list"]').parent().scrollTo('bottom');

      cy.get('[data-cy="select-option-Option 50"]').contains('Option 50').should('be.visible');
      cy.get('[data-cy="select-option-Option 1"]').contains('Option 1').should('not.be.visible');
    });
  });

  describe('Read-only Values', () => {
    const value = [{ name: 'Label 1' }, { name: 'Label 2', isReadOnly: true }];

    const options = [
      { value: 'Label 1', label: 'Label 1' },
      { value: 'Label 2', label: 'Label 2' },
      { value: 'Label 3', label: 'Label 3' },
    ];

    const defaultProps: FormGroupTypeAheadMultiSelectProps = {
      label: 'Select labels',
      options: options,
      isSubmitting: false,
      value: value,
      placeholderText: 'Type to search...',
      onHandleSelection: () => {},
      onHandleClear: () => {},
    };

    it('disables chips and dropdown option when value is read-only', () => {
      cy.mount(<FormGroupTypeAheadMultiSelect {...defaultProps} />);

      cy.get('[data-cy="selected-chip"]')
        .contains('Label 1')
        .parents('[data-cy="selected-chip"]')
        .within(() => {
          cy.get('button').should('be.visible');
        });
      cy.get('[data-cy="selected-chip"]')
        .contains('Label 2')
        .parents('[data-cy="selected-chip"]')
        .within(() => {
          cy.get('button').should('not.exist');
        });

      cy.get('input').click();
      cy.get('[data-cy="select-option-Label 1"]').find('button').should('not.be.disabled');
      cy.get('[data-cy="select-option-Label 2"]').find('button').should('be.disabled');
      cy.get('[data-cy="select-option-Label 3"]').find('button').should('not.be.disabled');
    });
  });
});
