import { TFunction } from 'i18next';
import { describe, expect, test } from 'vitest';
import { getNumberInputError } from './numberInputValidation';

const t = ((key: string, options?: Record<string, unknown>) =>
  key.replace(/{{(\w+)}}/g, (_match, name: string) => String(options?.[name]))) as TFunction;

describe('getNumberInputError', () => {
  test.each([[''], [null], [undefined], ['abc']])('should reject %s as not a number', (value) => {
    expect(getNumberInputError(value, {}, t)).toBe('Please enter a valid number.');
  });

  test('should reject a decimal when an integer is required', () => {
    expect(getNumberInputError('1.5', { isInteger: true }, t)).toBe(
      'Please enter a valid integer.'
    );
  });

  test('should accept a decimal when no integer is required', () => {
    expect(getNumberInputError('1.5', {}, t)).toBeUndefined();
  });

  test('should reject a value below min', () => {
    expect(getNumberInputError(0, { min: 1 }, t)).toBe('Value must be greater than or equal to 1.');
  });

  test('should reject a value above max', () => {
    expect(getNumberInputError('1000001', { max: 1000000 }, t)).toBe(
      'Value must be less than or equal to 1000000.'
    );
  });

  test.each([[1], ['1000000'], [500]])('should accept %s within the limits', (value) => {
    expect(
      getNumberInputError(value, { min: 1, max: 1000000, isInteger: true }, t)
    ).toBeUndefined();
  });
});
