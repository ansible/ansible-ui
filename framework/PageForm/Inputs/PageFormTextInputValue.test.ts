import type { UseFormSetValue } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import {
  createChangeHandler,
  handleNumberChange,
  resolveParsedValue,
} from './PageFormTextInputValue';

type FormValues = { value: number | string | null };

describe('resolveParsedValue', () => {
  it('returns non-datetime values unchanged', () => {
    expect(resolveParsedValue('text', '  value')).toBe('  value');
    expect(resolveParsedValue(undefined, 'value')).toBe('value');
  });

  it('returns an empty datetime-local value unchanged', () => {
    expect(resolveParsedValue('datetime-local', '')).toBe('');
  });

  it('converts stored UTC datetime-local values to the local input value', () => {
    const value = '2024-06-15T09:30:00.000Z';
    const utcDate = new Date(value);
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);

    expect(resolveParsedValue('datetime-local', value)).toBe(localDate.toISOString().slice(0, 16));
  });
});

describe('handleNumberChange', () => {
  it.each(['', 'not-a-number'])('clears invalid number input %s', (value) => {
    const setValue = vi.fn() as unknown as UseFormSetValue<FormValues>;
    const onChange = vi.fn();

    handleNumberChange<FormValues, 'value'>(value, { name: 'value', setValue, onChange });

    expect(setValue).toHaveBeenCalledWith('value', null);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it.each([
    ['12', 0, 10, 10],
    ['-1', 0, 10, 0],
    ['5', 0, 10, 5],
  ])('clamps %s to the supplied bounds', (value, min, max, expected) => {
    const setValue = vi.fn() as unknown as UseFormSetValue<FormValues>;
    const onChange = vi.fn();

    handleNumberChange<FormValues, 'value'>(value, { name: 'value', min, max, setValue, onChange });

    expect(setValue).toHaveBeenCalledWith('value', expected);
    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it('converts valid number input when no bounds are supplied', () => {
    const setValue = vi.fn() as unknown as UseFormSetValue<FormValues>;
    const onChange = vi.fn();

    handleNumberChange<FormValues, 'value'>('5', { name: 'value', setValue, onChange });

    expect(setValue).toHaveBeenCalledWith('value', 5);
    expect(onChange).toHaveBeenCalledWith(5);
  });
});

describe('createChangeHandler', () => {
  it('trims leading whitespace for text values', () => {
    const setValue = vi.fn() as unknown as UseFormSetValue<FormValues>;
    const onChange = vi.fn();
    const handleChange = createChangeHandler<FormValues, 'value'>({
      name: 'value',
      setValue,
      onChange,
    });

    handleChange('  text');

    expect(onChange).toHaveBeenCalledWith('text');
    expect(setValue).not.toHaveBeenCalled();
  });

  it('converts datetime-local values to UTC ISO strings', () => {
    const setValue = vi.fn() as unknown as UseFormSetValue<FormValues>;
    const onChange = vi.fn();
    const handleChange = createChangeHandler<FormValues, 'value'>({
      type: 'datetime-local',
      name: 'value',
      setValue,
      onChange,
    });
    const value = '2024-06-15T09:30';

    handleChange(value);

    expect(onChange).toHaveBeenCalledWith(new Date(value).toISOString());
  });

  it('uses numeric constraints for number values', () => {
    const setValue = vi.fn() as unknown as UseFormSetValue<FormValues>;
    const onChange = vi.fn();
    const handleChange = createChangeHandler<FormValues, 'value'>({
      type: 'number',
      name: 'value',
      min: 0,
      max: 10,
      setValue,
      onChange,
    });

    handleChange('12');

    expect(setValue).toHaveBeenCalledWith('value', 10);
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
