import { describe, expect, test, vi } from 'vitest';
import { FieldMetadata } from './PageFormOptionsContext';
import {
  createFieldValidate,
  runUserValidate,
  validateOptionsPattern,
} from './PageFormOptionsValidation';

const NAME_PATTERN: FieldMetadata = {
  pattern: '^[a-zA-Z0-9_-]+$',
  pattern_description: 'Name must contain only letters, numbers, underscores, and hyphens',
};

describe('validateOptionsPattern', () => {
  test('returns true when there is no field metadata', () => {
    expect(validateOptionsPattern('anything', undefined, true)).toBe(true);
  });

  test('returns true when field metadata has no pattern', () => {
    expect(validateOptionsPattern('anything', { pattern_description: 'desc' }, true)).toBe(true);
  });

  test('returns true when field is not dirty, even if the value violates the pattern', () => {
    expect(validateOptionsPattern('invalid@name', NAME_PATTERN, false)).toBe(true);
  });

  test('returns true for a non-string value', () => {
    expect(validateOptionsPattern(42, NAME_PATTERN, true)).toBe(true);
  });

  test('returns true for an empty string', () => {
    expect(validateOptionsPattern('', NAME_PATTERN, true)).toBe(true);
  });

  test('returns true when the value matches the pattern', () => {
    expect(validateOptionsPattern('valid-name_123', NAME_PATTERN, true)).toBe(true);
  });

  test('returns pattern_description when the value does not match the pattern', () => {
    expect(validateOptionsPattern('invalid@name', NAME_PATTERN, true)).toBe(
      'Name must contain only letters, numbers, underscores, and hyphens'
    );
  });

  test('falls back to a generic message when pattern_description is missing', () => {
    expect(validateOptionsPattern('invalid@name', { pattern: '^[a-z]+$' }, true)).toBe(
      'This field does not match the required pattern.'
    );
  });

  test('applies regex flags (e.g. unicode) when provided', () => {
    const unicodeMetadata: FieldMetadata = {
      pattern: '^[\\p{L}\\p{N}_]+$',
      pattern_description: 'Unicode letters only',
      flags: 'u',
    };
    expect(validateOptionsPattern('résumé', unicodeMetadata, true)).toBe(true);
  });
});

describe('runUserValidate', () => {
  test('returns true when no validate is provided', () => {
    expect(runUserValidate(undefined, 'value', {})).toBe(true);
  });

  test('calls a single validate function and returns its result', () => {
    const validate = vi.fn().mockReturnValue('custom error');
    expect(runUserValidate(validate, 'value', {})).toBe('custom error');
    expect(validate).toHaveBeenCalledWith('value', {});
  });

  test('runs all functions in a validate record and returns the first failure', () => {
    const first = vi.fn().mockReturnValue(true);
    const second = vi.fn().mockReturnValue('second failed');
    const third = vi.fn().mockReturnValue('should not run');

    expect(runUserValidate({ first, second, third }, 'value', {})).toBe('second failed');
    expect(first).toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
    expect(third).not.toHaveBeenCalled();
  });

  test('returns true when all functions in a validate record pass', () => {
    const first = vi.fn().mockReturnValue(true);
    const second = vi.fn().mockReturnValue(true);
    expect(runUserValidate({ first, second }, 'value', {})).toBe(true);
  });
});

describe('createFieldValidate', () => {
  test('runs OPTIONS pattern validation first, then skips user validate on failure', () => {
    const userValidate = vi.fn().mockReturnValue(true);
    const validate = createFieldValidate(NAME_PATTERN, userValidate, () => '');

    const result = validate('invalid@name', {});
    expect(result).toBe('Name must contain only letters, numbers, underscores, and hyphens');
    expect(userValidate).not.toHaveBeenCalled();
  });

  test('runs user validate after a passing OPTIONS pattern', () => {
    const userValidate = vi.fn().mockReturnValue('user error');
    const validate = createFieldValidate(NAME_PATTERN, userValidate, () => '');

    const result = validate('valid-name', {});
    expect(result).toBe('user error');
    expect(userValidate).toHaveBeenCalledWith('valid-name', {});
  });

  test('treats the field as clean (not dirty) when value matches the default', () => {
    const userValidate = vi.fn().mockReturnValue(true);
    const validate = createFieldValidate(NAME_PATTERN, userValidate, () => 'invalid@name');

    // Value equals the default -> not dirty -> pattern is skipped (grandfathering)
    const result = validate('invalid@name', {});
    expect(result).toBe(true);
    expect(userValidate).toHaveBeenCalledWith('invalid@name', {});
  });

  test('returns true when there is no metadata and no user validate', () => {
    const validate = createFieldValidate(undefined, undefined, () => '');
    expect(validate('anything', {})).toBe(true);
  });
});
