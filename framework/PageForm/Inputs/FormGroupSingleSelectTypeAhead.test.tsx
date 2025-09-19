import { render, screen } from '@testing-library/react';
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
