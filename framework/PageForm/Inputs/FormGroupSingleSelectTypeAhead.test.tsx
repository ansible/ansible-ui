import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormGroupSingleSelectTypeAhead } from './FormGroupSingleSelectTypeAhead';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

const defaultProps = {
  id: 'test-select',
  label: 'Test Select',
  options: mockOptions,
  onHandleSelection: vi.fn(),
  onHandleClear: vi.fn(),
  value: null,
};

describe('FormGroupSingleSelectTypeAhead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test basic functionality
  it('should allow typing and display dropdown', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.type(input, 'test');

    expect(input).toHaveValue('test');
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('should render grouped options', async () => {
    const user = userEvent.setup();
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        options={[
          { value: 'one', label: 'One', group: 'First' },
          { value: 'two', label: 'Two', group: 'First' },
          { value: 'three', label: 'Three', group: 'Second' },
        ]}
      />
    );

    await user.click(screen.getByRole('textbox'));

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should select an existing option and close the menu', async () => {
    const user = userEvent.setup({ delay: null });
    const onHandleSelection = vi.fn();
    const ControlledSelect = () => {
      const [value, setValue] = useState<string | null>(null);

      return (
        <FormGroupSingleSelectTypeAhead
          {...defaultProps}
          value={value}
          onHandleSelection={(selection) => {
            onHandleSelection(selection);
            setValue(selection.name);
          }}
        />
      );
    };
    const { rerender } = render(<ControlledSelect />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'Option 1' }));

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'option1' });
    await waitFor(() => {
      const updatedInput = screen.getByRole('textbox');
      expect(updatedInput).toHaveValue('Option 1');
      expect(updatedInput).toHaveAttribute('aria-expanded', 'false');
    });

    rerender(<ControlledSelect />);
    expect(screen.getByRole('textbox')).toHaveValue('Option 1');
  });

  it('should create a new option when creation is enabled', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} onHandleSelection={onHandleSelection} />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'New option');
    await user.click(screen.getByRole('option', { name: 'Create new option "New option"' }));

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'New option' });
    expect(input).toHaveValue('New option');
  });

  it('should not offer creation when creation is disabled', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} allowCreate={false} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Unknown option');

    expect(screen.queryByRole('option', { name: /Create new option/ })).not.toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'No results found for "Unknown option"' })
    ).toBeDisabled();
  });

  it('should show the required field indicator', () => {
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} isRequired />);

    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should show invalid helper text', () => {
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        helperTextInvalid="This field is required."
      />
    );

    expect(screen.getByText('This field is required.')).toBeInTheDocument();
  });

  it('should disable the input while submitting', () => {
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} isSubmitting />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should handle keyboard navigation with no options', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} options={[]} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('should safely navigate sparse option lists', async () => {
    const user = userEvent.setup();
    const sparseOptions = new Array<{ value: string; label: string }>(2);
    sparseOptions[1] = { value: 'option1', label: 'Option 1' };
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} options={sparseOptions} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');

    expect(input).toBeInTheDocument();
  });

  it('should move to the next option after an option is focused', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option1');
    });

    input.focus();
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option2');
  });

  it('should skip sparse entries while finding the next option', async () => {
    const user = userEvent.setup();
    const sparseOptions = new Array<{ value: string; label: string }>(2);
    sparseOptions[0] = { value: 'option0', label: 'Option 0' };
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} options={sparseOptions} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option0');
    });
    await user.keyboard('{ArrowDown}');

    expect(input).toBeInTheDocument();
  });

  it('should skip disabled entries while finding the next option', async () => {
    const user = userEvent.setup();
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        options={[
          { value: 'disabled', label: 'Disabled', isDisabled: true },
          { value: 'enabled', label: 'Enabled' },
        ]}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    input.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-enabled');
    });

    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-enabled');
  });

  // Test the core deletion fix - this is what was broken
  describe('Deletion Functionality', () => {
    it('should allow deleting typed characters with backspace', async () => {
      const user = userEvent.setup();
      render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Type text and verify it appears
      await user.click(input);
      await user.type(input, 'MKMO');
      expect(input).toHaveValue('MKMO');

      // Delete characters one by one
      await user.keyboard('{Backspace}');
      expect(input).toHaveValue('MKM');

      await user.keyboard('{Backspace}');
      expect(input).toHaveValue('MK');

      await user.keyboard('{Backspace}');
      expect(input).toHaveValue('M');

      await user.keyboard('{Backspace}');
      expect(input).toHaveValue('');
    });

    it('should allow clear button to work', async () => {
      const user = userEvent.setup();
      const mockOnHandleClear = vi.fn();
      render(
        <FormGroupSingleSelectTypeAhead {...defaultProps} onHandleClear={mockOnHandleClear} />
      );
      const input = screen.getByRole('textbox');

      // Type text
      await user.click(input);
      await user.type(input, 'test');
      expect(input).toHaveValue('test');

      // Click clear button
      const clearButton = await screen.findByRole('button', { name: /clear input value/i });
      await user.click(clearButton);

      // Verify clear handler was called
      expect(mockOnHandleClear).toHaveBeenCalled();
    });
  });

  // Test that input preservation still works when needed
  it('should preserve user input during prop updates while typing', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    // Start typing
    await user.click(input);
    await user.type(input, 'test');
    expect(input).toHaveValue('test');

    // Simulate prop value becoming null (React Hook Form clearing during typing)
    rerender(<FormGroupSingleSelectTypeAhead {...defaultProps} value={null} />);

    // Input should preserve user's typed text
    expect(input).toHaveValue('test');
  });

  // Test rapid focus/blur without timing issues (setTimeout removal)
  it('should handle rapid focus/blur without timing issues', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    // Rapid focus/blur sequence
    await user.click(input);
    await user.type(input, 'test');
    expect(input).toHaveValue('test');

    // Click outside (blur)
    await user.click(document.body);

    // Immediately click back in (focus)
    await user.click(input);

    // Should preserve the text without setTimeout
    expect(input).toHaveValue('test');
  });

  // Test menu close and immediate refocus
  it('should handle menu close and immediate refocus', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.type(input, 'test');

    // Close menu by clicking outside
    await user.click(document.body);

    // Immediately click back in
    await user.click(input);

    // Should work without setTimeout delays
    expect(input).toHaveValue('test');
  });

  it('supports legacy value shapes and values not present in the options', () => {
    const { rerender } = render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} value={['option1']} />
    );
    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('Option 1');

    rerender(<FormGroupSingleSelectTypeAhead {...defaultProps} value={{ name: 'option2' }} />);
    expect(input).toHaveValue('Option 2');

    rerender(<FormGroupSingleSelectTypeAhead {...defaultProps} value={{ name: 'unlisted' }} />);
    expect(input).toHaveValue('unlisted');

    rerender(<FormGroupSingleSelectTypeAhead {...defaultProps} value={[]} />);
    expect(input).toHaveValue('');

    rerender(<FormGroupSingleSelectTypeAhead {...defaultProps} value="" />);
    expect(input).toHaveValue('');
  });

  it('clears the displayed selection when the controlled value becomes null', async () => {
    const { rerender } = render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} value="option1" />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Option 1');

    rerender(<FormGroupSingleSelectTypeAhead {...defaultProps} value={null} />);

    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('updates a selected value label when its options arrive', async () => {
    const { rerender } = render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} options={[]} value="option1" />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('option1');

    rerender(
      <FormGroupSingleSelectTypeAhead {...defaultProps} options={mockOptions} value="option1" />
    );

    await waitFor(() => expect(input).toHaveValue('Option 1'));
  });

  it('offers creation when a query partially matches existing options', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.type(input, 'Option');

    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Create new option "Option"' })).toBeInTheDocument();
  });

  it('renders ungrouped options in the Other group', async () => {
    const user = userEvent.setup();
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        options={[
          { value: 'ungrouped', label: 'Ungrouped option' },
          { value: 'named', label: 'Named option', group: 'Named group' },
          { value: 'named2', label: 'Another named option', group: 'Named group' },
        ]}
      />
    );

    await user.click(screen.getByRole('textbox'));

    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Named group')).toBeInTheDocument();
  });

  it('opens with Enter, navigates upward, and selects the focused option', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} onHandleSelection={onHandleSelection} />
    );
    const input = screen.getByRole('textbox');

    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Enter}');
    expect(onHandleSelection).not.toHaveBeenCalled();

    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option1');
    await user.keyboard('{Enter}');

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'option1' });
  });

  it('does not focus options when every choice is disabled', async () => {
    const user = userEvent.setup();
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        options={[
          { value: 'disabled1', label: 'Disabled 1', isDisabled: true },
          { value: 'disabled2', label: 'Disabled 2', isDisabled: true },
        ]}
      />
    );
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('starts arrow-up at the last option when nothing is active', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    input.focus();
    await user.keyboard('{ArrowUp}');

    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option2');
  });

  it('skips disabled options and selects the next enabled option', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        onHandleSelection={onHandleSelection}
        options={[
          { value: 'disabled', label: 'Disabled', isDisabled: true },
          { value: 'enabled', label: 'Enabled' },
        ]}
      />
    );
    const input = screen.getByRole('textbox');

    await user.click(input);
    input.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'enabled' });
  });

  it('closes an open menu when the empty input is clicked again', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps an open menu open when the populated input is clicked', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.type(input, 'Option');
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveValue('Option');
  });

  it('navigates and selects through the focused textbox keyboard handler', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} onHandleSelection={onHandleSelection} />
    );
    const input = screen.getByRole('textbox');

    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option1');

    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option2');

    input.focus();
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option1');

    input.focus();
    await user.keyboard('{Enter}');
    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'option1' });
  });

  it('selects the keyboard-focused option from the input key handler', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} onHandleSelection={onHandleSelection} />
    );
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.type(input, 'Option 1');
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option1');

    input.focus();
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-option1');

    input.focus();
    await user.keyboard('{Enter}');
    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'option1' });
  });

  it('returns no next index when derived options contain no focusable item', async () => {
    const user = userEvent.setup();
    const options = [{ value: 'disabled', label: 'Disabled', isDisabled: true }];
    const derivedOptions = Object.assign(
      [{ value: 'disabled', children: 'Disabled', isDisabled: true }],
      { every: () => false }
    );
    vi.spyOn(options, 'map').mockReturnValue(derivedOptions);
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} options={options} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-disabled');
    input.focus();
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-activedescendant', 'select-create-typeahead-disabled');
  });

  it('clears a selected value through the clear control', async () => {
    const user = userEvent.setup();
    const onHandleClear = vi.fn();
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        value="option1"
        onHandleClear={onHandleClear}
      />
    );
    const input = screen.getByRole('textbox');

    await user.click(screen.getByRole('button', { name: /clear input value/i }));

    expect(input).toHaveValue('');
    expect(onHandleClear).toHaveBeenCalledOnce();
  });

  it('resolves selected labels from the source options when mapped options are empty', async () => {
    const options = [...mockOptions];
    vi.spyOn(options, 'map').mockReturnValue([]);
    const { rerender } = render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} options={options} value="option1" />
    );
    const input = screen.getByRole('textbox');

    rerender(
      <FormGroupSingleSelectTypeAhead {...defaultProps} options={options} value="option2" />
    );
    await waitFor(() => expect(input).toHaveValue('Option 2'));

    rerender(
      <FormGroupSingleSelectTypeAhead {...defaultProps} options={options} value="unlisted" />
    );
    await waitFor(() => expect(input).toHaveValue('unlisted'));
  });

  it('opens and closes the menu from its toggle button', async () => {
    const user = userEvent.setup();
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} />);
    const input = screen.getByRole('textbox');
    const toggle = screen.getByRole('button', { name: 'Typeahead creatable menu toggle' });

    await user.click(toggle);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveFocus();

    await user.click(toggle);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores a selection that collides with the no-results sentinel', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    render(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        options={[{ value: 'NO_RESULTS', label: 'Reserved value' }]}
        onHandleSelection={onHandleSelection}
      />
    );

    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByRole('option', { name: 'Reserved value' }));

    expect(onHandleSelection).not.toHaveBeenCalled();
  });

  it('keeps the active item unchanged when no option can receive focus', async () => {
    const user = userEvent.setup();
    const options = [{ value: 'disabled', label: 'Disabled', isDisabled: true }];
    const derivedOptions = Object.assign(
      [{ value: 'disabled', children: 'Disabled', isDisabled: true }],
      { every: () => false }
    );
    vi.spyOn(options, 'map').mockReturnValue(derivedOptions);
    render(<FormGroupSingleSelectTypeAhead {...defaultProps} options={options} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.keyboard('{ArrowDown}');
    const activeItem = input.getAttribute('aria-activedescendant');
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-activedescendant', activeItem);
  });
});
