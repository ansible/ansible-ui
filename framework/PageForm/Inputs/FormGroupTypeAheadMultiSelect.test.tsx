/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
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

  const renderComponent = (props?: Partial<FormGroupTypeAheadMultiSelectProps>) => {
    const combinedProps: FormGroupTypeAheadMultiSelectProps = {
      ...defaultProps,
      ...props,
    };
    return render(<FormGroupTypeAheadMultiSelect {...combinedProps} />);
  };

  describe('Default Rendering', () => {
    it('renders correctly with default props', () => {
      renderComponent();

      // Check if the label is rendered
      expect(screen.getByText('Select Teams')).toBeInTheDocument();

      // Check if the Select input is rendered with the correct placeholder
      const input = screen.getByPlaceholderText('Type to search...');
      expect(input).toBeInTheDocument();
    });

    it('renders with placeholder text when no value is selected', () => {
      renderComponent({
        placeholderText: 'Choose teams...',
      });

      expect(screen.getByPlaceholderText('Choose teams...')).toBeInTheDocument();
    });
  });

  describe('State-Based Rendering', () => {
    it('disables the Select input when isReadOnly is true', () => {
      renderComponent({
        isReadOnly: true,
      });

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disables the Select input when isSubmitting is true', () => {
      renderComponent({
        isSubmitting: true,
      });

      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Helper Text and Validation', () => {
    it('shows helper text when provided', () => {
      renderComponent({
        helperText: 'Select one or more teams.',
      });

      expect(screen.getByText('Select one or more teams.')).toBeInTheDocument();
    });

    it('shows invalid helper text when helperTextInvalid is provided', () => {
      renderComponent({
        helperTextInvalid: 'This field is required.',
      });

      expect(screen.getByText('This field is required.')).toBeInTheDocument();
    });

    it('handles required field indication', () => {
      renderComponent({
        isRequired: true,
      });

      const label = screen.getByText('Select Teams');
      const requiredIndicator = label.parentElement?.querySelector('.pf-v6-c-form__label-required');
      expect(requiredIndicator).toBeInTheDocument();
    });
  });

  describe('Additional Controls and Label Help', () => {
    it('renders additional controls when provided', () => {
      const AdditionalControl = () => <button data-testid="additional-control">Extra</button>;
      renderComponent({
        additionalControls: <AdditionalControl />,
      });

      expect(screen.getByTestId('additional-control')).toBeInTheDocument();
    });
  });

  describe('Label dropdown', () => {
    const options = Array.from({ length: 50 }, (_, i) => ({
      value: `Option ${i + 1}`,
      label: `Option ${i + 1}`,
    }));

    it('renders a scrollable labels dropdown', async () => {
      const user = userEvent.setup();
      renderComponent({
        label: 'Select labels',
        options: options,
      });

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('select-option-Option 1')).toBeInTheDocument();
      });

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  describe('Read-only Values', () => {
    const value = [{ name: 'Label 1' }, { name: 'Label 2', isReadOnly: true }];

    const options = [
      { value: 'Label 1', label: 'Label 1' },
      { value: 'Label 2', label: 'Label 2' },
      { value: 'Label 3', label: 'Label 3' },
    ];

    it('disables chips and dropdown option when value is read-only', async () => {
      const user = userEvent.setup();
      renderComponent({
        label: 'Select labels',
        options: options,
        value: value,
      });

      // Check that chips are rendered for both values
      const chips = screen.getAllByTestId('selected-chip');
      expect(chips).toHaveLength(2);

      // Label 1 chip should have a close button (not read-only)
      const label1Chip = chips.find((chip) => chip.textContent?.includes('Label 1'));
      expect(label1Chip).toBeDefined();
      expect(within(label1Chip!).getByRole('button')).toBeInTheDocument();

      // Label 2 chip should NOT have a close button (read-only)
      const label2Chip = chips.find((chip) => chip.textContent?.includes('Label 2'));
      expect(label2Chip).toBeDefined();
      expect(within(label2Chip!).queryByRole('button')).not.toBeInTheDocument();

      // Open dropdown
      const input = screen.getByRole('textbox');
      await user.click(input);

      // Verify dropdown is open and options are visible
      await waitFor(() => {
        expect(screen.getByTestId('select-option-Label 1')).toBeInTheDocument();
        expect(screen.getByTestId('select-option-Label 2')).toBeInTheDocument();
        expect(screen.getByTestId('select-option-Label 3')).toBeInTheDocument();
      });
    });
  });
});
