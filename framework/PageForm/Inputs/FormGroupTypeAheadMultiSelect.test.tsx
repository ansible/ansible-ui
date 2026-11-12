/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

  it('selects the first matching option with Enter', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    renderComponent({ onHandleSelection });

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Team 1');
    await user.keyboard('{Enter}');

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'Team 1' });
  });

  it('filters options as the user types', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Team 2');

    expect(screen.getByTestId('select-option-team2')).toBeInTheDocument();
    expect(screen.queryByTestId('select-option-team1')).not.toBeInTheDocument();
  });

  it('clears a removable selected chip', async () => {
    const user = userEvent.setup();
    const onHandleClear = vi.fn();
    renderComponent({
      onHandleClear,
      value: [{ name: 'Team 1' }],
    });

    const chip = screen.getByTestId('selected-chip');
    await user.click(within(chip).getByRole('button'));

    expect(onHandleClear).toHaveBeenCalledWith('Team 1');
  });

  it('clears the input filter without clearing selected values', async () => {
    const user = userEvent.setup();
    const onHandleClear = vi.fn();
    renderComponent({
      onHandleClear,
      value: [{ name: 'Team 1' }],
    });

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Team 2');
    await user.click(screen.getByTestId('clear-button'));

    expect(onHandleClear).not.toHaveBeenCalled();
    expect(input).toHaveValue('');
    expect(screen.getByTestId('selected-chip')).toHaveTextContent('Team 1');
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

      expect(screen.getByText('Select Teams')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
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

    it('renders read-only chips without close buttons', async () => {
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

  it('opens while typing and creates a new option for an unmatched value', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    renderComponent({ onHandleSelection });

    const input = screen.getByRole('textbox');
    await user.type(input, 'New team');

    const createOption = await screen.findByRole('option', { name: 'Create "New team"' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await user.click(createOption);

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'New team' });
  });

  it('offers creation alongside partial matches', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Team');

    expect(screen.getByRole('option', { name: 'Team 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Create "Team"' })).toBeInTheDocument();
  });

  it('ignores an empty-valued option and renders it with a stable label key', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    renderComponent({
      onHandleSelection,
      options: [{ value: '', label: 'Empty value option' }],
    });

    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByRole('option', { name: 'Empty value option' }));

    expect(onHandleSelection).not.toHaveBeenCalled();
  });

  it('handles Enter with no options and supports arrow navigation and Escape', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    const { rerender } = renderComponent({ options: [], onHandleSelection });
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.keyboard('{Enter}');
    expect(onHandleSelection).not.toHaveBeenCalled();

    rerender(
      <FormGroupTypeAheadMultiSelect {...defaultProps} onHandleSelection={onHandleSelection} />
    );
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'option-0');

    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'option-2');

    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('opens and closes from the menu toggle and outside click', async () => {
    const user = userEvent.setup();
    renderComponent();
    const input = screen.getByRole('textbox');
    const toggle = screen.getByRole('button', { name: 'Menu toggle' });

    await user.click(toggle);
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByText('Select Teams'));
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not render chips for empty selection names', () => {
    renderComponent({ value: [{ name: '' }] });

    expect(screen.queryByTestId('selected-chip')).not.toBeInTheDocument();
  });

  it('clears all selections from the label group close control', async () => {
    const user = userEvent.setup();
    const onHandleClear = vi.fn();
    renderComponent({ value: [{ name: 'Read only', isReadOnly: true }], onHandleClear });

    await user.click(screen.getByRole('button', { name: 'Close label group' }));

    expect(onHandleClear).toHaveBeenCalledWith();
  });

  it('converts a non-string option label before selecting it', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    const options = [{ value: 'numeric-label', label: 42 as unknown as string }];
    renderComponent({ options, onHandleSelection });

    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByRole('option', { name: '42' }));

    expect(onHandleSelection).toHaveBeenCalledWith({ name: '42' });
  });

  it('selects options whose value is an object', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    const options = [{ value: { name: 'Team object' }, label: 'Team object' }];
    renderComponent({ options, onHandleSelection });

    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByRole('option', { name: 'Team object' }));

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'Team object' });
  });

  it('does not select an option with an undefined value on Enter', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    const options = [{ value: undefined as unknown as string, label: 'Undefined value' }];
    renderComponent({ options, onHandleSelection });
    const input = screen.getByRole('textbox');

    await user.click(input);
    await screen.findByRole('option', { name: 'Undefined value' });
    await user.keyboard('{Enter}');

    expect(onHandleSelection).not.toHaveBeenCalled();
  });

  it('ignores a selection when its option lookup is stale', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    const options = [{ value: 'stale', label: 'Stale option' }];
    const derivedOptions = Object.assign([{ value: 'stale', children: 'Stale option' }], {
      find: () => undefined,
    });
    vi.spyOn(options, 'map').mockReturnValue(derivedOptions);
    renderComponent({ options, onHandleSelection });

    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByRole('option', { name: 'Stale option' }));

    expect(onHandleSelection).not.toHaveBeenCalled();
  });
});
