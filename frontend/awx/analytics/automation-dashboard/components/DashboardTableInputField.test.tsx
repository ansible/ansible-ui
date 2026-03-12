/* eslint-disable i18next/no-literal-string */
import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DashboardTableInputField } from './DashboardTableInputField';
import { render, waitFor } from '@testing-library/react';

function renderInputField(props = {}) {
  return render(
    <DashboardTableInputField
      id={'test-input'}
      currentValue={0}
      min={0}
      max={100}
      label={'Test Input'}
      onBlur={() => {}}
      {...props}
    />
  );
}

describe('DashboardTableInputField', () => {
  describe('min/max value clamping for number type', () => {
    test.each([
      {
        min: 0,
        max: 10,
        type: undefined,
        input: '555',
        expected: '10',
        desc: 'clamp to max',
      },
      {
        min: 10,
        max: 100,
        type: undefined,
        input: '1',
        expected: '10',
        desc: 'clamp to min',
      },
      {
        min: 0,
        max: 100,
        type: undefined,
        input: '55',
        expected: '55',
        desc: 'allow within range',
      },
    ])('should $desc', async ({ min, max, type, input, expected }) => {
      const user = userEvent.setup();
      const { container } = renderInputField({ min, max, type });
      const inputEl = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(inputEl);
      await user.type(inputEl, input);
      await waitFor(() => {
        expect(inputEl.value).toBe(expected);
      });
    });
  });

  describe('validation tests', () => {
    test('should display zero value from currentValue', () => {
      const { container } = renderInputField({ currentValue: 0 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input.value).toBe('0');
    });

    test('should update displayed value when currentValue changes', () => {
      const onBlur = vi.fn();
      const { container, rerender } = render(
        <DashboardTableInputField
          id={'test-input'}
          currentValue={5}
          min={0}
          max={100}
          label={'Test Input'}
          onBlur={onBlur}
        />
      );
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input.value).toBe('5');

      rerender(
        <DashboardTableInputField
          id={'test-input'}
          currentValue={9}
          min={0}
          max={100}
          label={'Test Input'}
          onBlur={onBlur}
        />
      );
      expect(input.value).toBe('9');
    });

    test('should display initial value from currentValue', () => {
      const { container } = renderInputField({ currentValue: 42 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    test('should call onBlur when input loses focus and value change', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      const { container } = renderInputField({ onBlur });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      input.focus();
      await user.type(input, '1');
      input.blur();
      expect(onBlur).toHaveBeenCalled();
    });

    test('should not call onBlur when input loses focus and value does not change', () => {
      const onBlur = vi.fn();
      const { container } = renderInputField({ onBlur });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      input.focus();
      input.blur();
      expect(onBlur).not.toHaveBeenCalled();
    });

    test('should ignore non-numeric input', async () => {
      const user = userEvent.setup();
      const { container } = renderInputField({ currentValue: 7, min: 0, max: 10 });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.type(input, 'abc');
      await waitFor(() => {
        expect(input.value).toBe('7');
      });
    });

    test('should show error for decimal input when type is integer', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      const { container, findByText } = renderInputField({
        currentValue: 5,
        min: 0,
        max: 10,
        type: 'integer',
        onBlur,
      });
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '5.5');
      input.blur();
      expect(await findByText('Please enter a valid integer.')).toBeInTheDocument();
      expect(onBlur).not.toHaveBeenCalled();
    });

    test.each([
      { input: '', error: 'Please enter a valid number.' },
      { input: 'abc', error: 'Please enter a valid number.' },
    ])('should show error for invalid input: "$input"', async ({ input, error }) => {
      const user = userEvent.setup();
      const { container, findByText } = renderInputField({ currentValue: 5, min: 0, max: 10 });
      const inputEl = container.querySelector('input[type="number"]') as HTMLInputElement;
      await user.clear(inputEl);
      if (input) await user.type(inputEl, input);
      inputEl.blur();
      expect(await findByText(error)).toBeInTheDocument();
    });
  });
});
