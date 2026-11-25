import type { ValidationRule } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { createTextInputRules } from './PageFormTextInputValidation';

describe('createTextInputRules', () => {
  it('creates readable messages for labeled numeric constraints', () => {
    const validate = () => true;
    const pattern: ValidationRule<RegExp> = { value: /[0-9]+/, message: 'Use digits' };

    const rules = createTextInputRules({
      label: 'name',
      required: true,
      validate,
      minLength: 2,
      maxLength: 8,
      min: 1,
      max: '10',
      pattern,
    });

    expect(rules).toEqual({
      required: true,
      validate,
      minLength: { value: 2, message: 'Name must be at least 2 characters.' },
      maxLength: { value: 8, message: 'Name cannot be greater than 8 characters.' },
      min: { value: 1, message: 'Name must be greater or equal to 1.' },
      max: { value: '10', message: 'Name cannot be greater than 10.' },
      pattern,
    });
  });

  it('preserves raw constraints when no label is provided', () => {
    const minLength: ValidationRule<number> = { value: 2, message: 'Custom minimum' };
    const rules = createTextInputRules({
      required: false,
      validate: undefined,
      minLength,
      maxLength: 8,
      min: '1',
      max: 10,
    });

    expect(rules.minLength).toBe(minLength);
    expect(rules.maxLength).toBe(8);
    expect(rules.min).toBe('1');
    expect(rules.max).toBe(10);
  });

  it('preserves custom length rules while formatting string and number bounds', () => {
    const minLength: ValidationRule<number> = { value: 2, message: 'Custom minimum' };
    const maxLength: ValidationRule<number> = { value: 8, message: 'Custom maximum' };
    const rules = createTextInputRules({
      label: 'name',
      required: false,
      validate: undefined,
      minLength,
      maxLength,
      min: '1',
      max: 10,
    });

    expect(rules.minLength).toBe(minLength);
    expect(rules.maxLength).toBe(maxLength);
    expect(rules.min).toEqual({ value: '1', message: 'Name must be greater or equal to 1.' });
    expect(rules.max).toEqual({ value: 10, message: 'Name cannot be greater than 10.' });
  });
});
