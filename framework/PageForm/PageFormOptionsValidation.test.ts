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
      pattern: String.raw`^[\p{L}\p{N}_]+$`,
      pattern_description: 'Unicode letters only',
      flags: 'u',
    };
    expect(validateOptionsPattern('résumé', unicodeMetadata, true)).toBe(true);
  });

  test('normalizes with NFC before pattern validation when normalize is set', () => {
    const decomposedEAcute = 'e\u0301';
    const metadata: FieldMetadata = {
      pattern: '^.$',
      pattern_description: 'exactly one character',
      normalize: 'NFC',
    };
    expect(decomposedEAcute).toHaveLength(2);
    expect(validateOptionsPattern(decomposedEAcute, metadata, true)).toBe(true);
  });

  test('without normalize, decomposed Unicode is validated as entered', () => {
    const decomposedEAcute = 'e\u0301';
    const metadata: FieldMetadata = {
      pattern: '^.$',
      pattern_description: 'exactly one character',
    };
    expect(validateOptionsPattern(decomposedEAcute, metadata, true)).toBe('exactly one character');
  });

  test('NFC normalization can satisfy a max-length pattern after shortening', () => {
    const decomposedEAcute = 'e\u0301';
    const metadata: FieldMetadata = {
      pattern: '^.{1}$',
      pattern_description: 'at most one character',
      normalize: 'NFC',
    };
    expect(validateOptionsPattern(decomposedEAcute, metadata, true)).toBe(true);
    expect(
      validateOptionsPattern(decomposedEAcute, { ...metadata, normalize: undefined }, true)
    ).toBe('at most one character');
  });

  test('skips pattern validation for an unsupported normalize form', () => {
    const metadata: FieldMetadata = {
      pattern: '^[a-z]+$',
      pattern_description: 'lowercase only',
      normalize: 'INVALID',
    };
    expect(validateOptionsPattern('NOT_LOWERCASE', metadata, true)).toBe(true);
  });

  test('skips pattern validation when regex flags are invalid', () => {
    const metadata: FieldMetadata = {
      pattern: '^[a-z]+$',
      pattern_description: 'lowercase only',
      flags: 'x',
    };
    expect(validateOptionsPattern('NOT_LOWERCASE', metadata, true)).toBe(true);
  });

  test('returns true when the pattern cannot be compiled at validation time', () => {
    expect(validateOptionsPattern('value', { pattern: '[' }, true)).toBe(true);
  });

  test('sanitizes pattern_description in error messages', () => {
    const metadata: FieldMetadata = {
      pattern: '^[a-z]+$',
      pattern_description: 'bad <script>hint</script>',
    };
    expect(validateOptionsPattern('UPPER', metadata, true)).toBe('bad scripthint/script');
  });

  test('applies NFKC normalization before pattern validation', () => {
    const metadata: FieldMetadata = {
      pattern: '^.$',
      pattern_description: 'exactly one character',
      normalize: 'NFKC',
    };
    expect(validateOptionsPattern('e\u0301', metadata, true)).toBe(true);
  });

  test('applies NFD normalization before pattern validation', () => {
    const composedEAcute = '\u00e9';
    const metadata: FieldMetadata = {
      pattern: '^.{2}$',
      pattern_description: 'exactly two characters',
      normalize: 'NFD',
    };
    expect(composedEAcute).toHaveLength(1);
    expect(validateOptionsPattern(composedEAcute, metadata, true)).toBe(true);
  });

  test('applies NFKD normalization before pattern validation', () => {
    const ligatureFi = '\uFB01';
    const metadata: FieldMetadata = {
      pattern: '^.{2}$',
      pattern_description: 'exactly two characters',
      normalize: 'NFKD',
    };
    expect(validateOptionsPattern(ligatureFi, metadata, true)).toBe(true);
  });

  test('still returns pattern error when normalized value does not match', () => {
    const metadata: FieldMetadata = {
      pattern: '^[a-z]+$',
      pattern_description: 'lowercase only',
      normalize: 'NFC',
    };
    expect(validateOptionsPattern('NOT_LOWERCASE', metadata, true)).toBe('lowercase only');
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

  test('passes the original form value to user validate when normalize is used for pattern only', () => {
    const decomposedEAcute = 'e\u0301';
    const metadata: FieldMetadata = {
      pattern: '^.$',
      pattern_description: 'exactly one character',
      normalize: 'NFC',
    };
    const userValidate = vi.fn().mockReturnValue(true);
    const validate = createFieldValidate(metadata, userValidate, () => '');

    expect(validate(decomposedEAcute, {})).toBe(true);
    expect(userValidate).toHaveBeenCalledWith(decomposedEAcute, {});
    expect(decomposedEAcute).toHaveLength(2);
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
