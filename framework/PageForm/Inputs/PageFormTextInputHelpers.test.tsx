import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import {
  createPatternBlurHandler,
  PasswordRevealButton,
  resolveAutoComplete,
  resolveHelperTextInvalid,
  resolveInputType,
  SelectLookupButton,
} from './PageFormTextInputHelpers';

describe('resolveInputType', () => {
  test('returns the given type unchanged for non-password fields', () => {
    expect(resolveInputType('text', false)).toBe('text');
    expect(resolveInputType(undefined, false)).toBeUndefined();
  });

  test('returns "password" when a password field is hidden', () => {
    expect(resolveInputType('password', false)).toBe('password');
  });

  test('returns "text" when a password field is revealed', () => {
    expect(resolveInputType('password', true)).toBe('text');
  });
});

describe('resolveAutoComplete', () => {
  test('returns the explicit autoComplete value when provided', () => {
    expect(resolveAutoComplete('current-password', 'password')).toBe('current-password');
    expect(resolveAutoComplete('on', 'text')).toBe('on');
  });

  test('defaults password fields to "new-password"', () => {
    expect(resolveAutoComplete(undefined, 'password')).toBe('new-password');
  });

  test('defaults non-password fields to "off"', () => {
    expect(resolveAutoComplete(undefined, 'text')).toBe('off');
    expect(resolveAutoComplete(undefined, undefined)).toBe('off');
  });
});

describe('resolveHelperTextInvalid', () => {
  test('returns undefined when there is no error', () => {
    expect(resolveHelperTextInvalid(undefined, true, true, 'Validating...')).toBeUndefined();
  });

  test('returns the error message when not validating', () => {
    expect(resolveHelperTextInvalid('Required', true, false, 'Validating...')).toBe('Required');
  });

  test('returns the error message when there is no validate prop', () => {
    expect(resolveHelperTextInvalid('Required', false, true, 'Validating...')).toBe('Required');
  });

  test('returns the validating placeholder while an async validate is running', () => {
    expect(resolveHelperTextInvalid('Required', true, true, 'Validating...')).toBe('Validating...');
  });
});

describe('createPatternBlurHandler', () => {
  test('returns the original onBlur when there is no pattern', () => {
    const onBlur = vi.fn();
    const trigger = vi.fn();
    const handler = createPatternBlurHandler(false, onBlur, trigger, 'name');
    expect(handler).toBe(onBlur);
  });

  test('calls onBlur and triggers validation when a pattern exists', () => {
    const onBlur = vi.fn();
    const trigger = vi.fn().mockResolvedValue(true);
    const handler = createPatternBlurHandler(true, onBlur, trigger, 'name');

    handler();

    expect(onBlur).toHaveBeenCalled();
    expect(trigger).toHaveBeenCalledWith('name');
  });
});

describe('PasswordRevealButton', () => {
  test('shows the closed-eye icon and reveals on click', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<PasswordRevealButton showSecret={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalled();
  });

  test('is disabled when isDisabled or isReadOnly is set', () => {
    render(<PasswordRevealButton showSecret isDisabled onToggle={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('SelectLookupButton', () => {
  test('renders and is disabled while submitting', () => {
    render(
      <SelectLookupButton selectTitle="Browse" setValue={vi.fn()} name="field" isSubmitting />
    );
    expect(screen.getByRole('button', { name: 'Options menu' })).toBeDisabled();
  });

  test('invokes selectOpen and applies the selected value', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    const selectOpen = vi.fn((callback: (item: { value: string }) => void) => {
      callback({ value: 'picked' });
    });

    render(
      <SelectLookupButton
        selectTitle="Browse"
        selectOpen={selectOpen}
        selectValue={(item: { value: string }) => item.value}
        setValue={setValue}
        name="field"
        isSubmitting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Options menu' }));

    expect(selectOpen).toHaveBeenCalledWith(expect.any(Function), 'Browse');
    expect(setValue).toHaveBeenCalledWith('field', 'picked', { shouldValidate: true });
  });

  test('does nothing when selectValue is not provided', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    const selectOpen = vi.fn((callback: (item: { value: string }) => void) => {
      callback({ value: 'picked' });
    });

    render(
      <SelectLookupButton
        selectTitle="Browse"
        selectOpen={selectOpen}
        setValue={setValue}
        name="field"
        isSubmitting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Options menu' }));

    expect(setValue).not.toHaveBeenCalled();
  });
});
