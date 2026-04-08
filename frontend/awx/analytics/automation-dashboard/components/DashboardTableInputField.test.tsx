/* eslint-disable i18next/no-literal-string */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DashboardTableInputField } from './DashboardTableInputField';
import { render, waitFor, fireEvent, act } from '@testing-library/react';

function renderInputField(props = {}) {
  return render(
    <DashboardTableInputField
      id="test-input"
      value={0}
      min={0}
      max={100}
      label="Test Input"
      onChange={() => {}}
      {...props}
    />
  );
}

describe('DashboardTableInputField', () => {
  describe('display', () => {
    test('should display initial value from value prop', () => {
      const { container } = renderInputField({ value: 42 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    test('should display zero value from value prop', () => {
      const { container } = renderInputField({ value: 0 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input.value).toBe('0');
    });

    test('should update displayed value when value prop changes', () => {
      const { container, rerender } = render(
        <DashboardTableInputField
          id="test-input"
          value={5}
          min={0}
          max={100}
          label="Test Input"
          onChange={() => {}}
        />
      );
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input.value).toBe('5');

      rerender(
        <DashboardTableInputField
          id="test-input"
          value={9}
          min={0}
          max={100}
          label="Test Input"
          onChange={() => {}}
        />
      );
      expect(input.value).toBe('9');
    });
  });

  describe('onChange debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    test('should call onChange with valid value after debounce delay', async () => {
      const onChange = vi.fn();
      const { container } = renderInputField({ value: 0, onChange });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '50' } });
      await act(() => vi.advanceTimersByTime(600));
      expect(onChange).toHaveBeenCalledWith(50);
    });

    test('should not call onChange for empty input', async () => {
      const onChange = vi.fn();
      const { container } = renderInputField({ value: 5, onChange });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });
      await act(() => vi.advanceTimersByTime(600));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('should not call onChange for value above max', async () => {
      const onChange = vi.fn();
      const { container } = renderInputField({ value: 0, min: 0, max: 10, onChange });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '555' } });
      await act(() => vi.advanceTimersByTime(600));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('should not call onChange for value below min', async () => {
      const onChange = vi.fn();
      const { container } = renderInputField({ value: 50, min: 10, max: 100, onChange });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '1' } });
      await act(() => vi.advanceTimersByTime(600));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('should not call onChange for non-integer when type is integer', async () => {
      const onChange = vi.fn();
      const { container } = renderInputField({ value: 5, type: 'integer', onChange });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5.5' } });
      await act(() => vi.advanceTimersByTime(600));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    test('should show error immediately for empty input', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderInputField({ value: 5 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(input);
      expect(await findByText('Please enter a valid number.')).toBeInTheDocument();
    });

    test('should show error immediately for value above max', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderInputField({ value: 0, min: 0, max: 10 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '555');
      expect(await findByText('Value must be less than or equal to 10.')).toBeInTheDocument();
    });

    test('should show error immediately for value below min', async () => {
      const user = userEvent.setup();
      const { container, findByText } = renderInputField({ value: 50, min: 10, max: 100 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '1');
      expect(await findByText('Value must be greater than or equal to 10.')).toBeInTheDocument();
    });

    test('should show error immediately for decimal input when type is integer', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container, findByText } = renderInputField({
        value: 5,
        min: 0,
        max: 10,
        type: 'integer',
        onChange,
      });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '5.5');
      expect(await findByText('Please enter a valid integer.')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    test('should ignore non-numeric input', async () => {
      const user = userEvent.setup();
      const { container } = renderInputField({ value: 7, min: 0, max: 10 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.type(input, 'abc');
      await waitFor(() => {
        expect(input.value).toBe('7');
      });
    });

    test('should clear error when valid input follows invalid', async () => {
      const user = userEvent.setup();
      const { container } = renderInputField({ value: 5, min: 0, max: 10 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '555');
      await user.clear(input);
      await user.type(input, '5');
      await waitFor(() => {
        expect(
          container.querySelector('.pf-v6-c-helper-text__item--error')
        ).not.toBeInTheDocument();
      });
    });

    test('should show errorMsg prop when no internal validation error is present', () => {
      const { getByText } = renderInputField({ error: 'Server-side error' });
      expect(getByText('Server-side error')).toBeInTheDocument();
    });
  });

  describe('UI', () => {
    test('should render help icon when labelHelp is provided', () => {
      const { container } = renderInputField({ labelHelp: 'Helpful hint' });
      expect(container.querySelector('button[type="button"]')).toBeInTheDocument();
    });

    test('should apply span 24 grid column style when fullWidth is true', () => {
      const { container } = renderInputField({ fullWidth: true });
      const formGroup = container.querySelector('.pf-v6-c-form__group') as HTMLElement;
      expect(formGroup.style.gridColumn).toBe('span 24');
    });

    test('should omit aria-describedby when id is empty string', () => {
      const { container } = renderInputField({ id: '' });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input.getAttribute('aria-describedby')).toBeNull();
    });

    test('should prevent default form submission', () => {
      const { container } = renderInputField({ value: 5 });
      const form = container.querySelector('form')!;
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      fireEvent(form, submitEvent);
      expect(submitEvent.defaultPrevented).toBe(true);
    });
  });
});
