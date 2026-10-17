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
          { value: 'two', label: 'Two', group: 'Second' },
        ]}
      />
    );

    await user.click(screen.getByRole('textbox'));

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should select an existing option and close the menu', async () => {
    const user = userEvent.setup();
    const onHandleSelection = vi.fn();
    const { rerender } = render(
      <FormGroupSingleSelectTypeAhead {...defaultProps} onHandleSelection={onHandleSelection} />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'Option 1' }));

    expect(onHandleSelection).toHaveBeenCalledWith({ name: 'option1' });
    rerender(
      <FormGroupSingleSelectTypeAhead
        {...defaultProps}
        onHandleSelection={onHandleSelection}
        value="option1"
      />
    );
    await waitFor(() => {
      expect(input).toHaveValue('Option 1');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
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
});
