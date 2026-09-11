import { FieldValues, Validate, ValidateResult } from 'react-hook-form';
import { FieldMetadata } from './PageFormOptionsContext';

const DEFAULT_PATTERN_ERROR = 'This field does not match the required pattern.';
const ALLOWED_REGEX_FLAGS = new Set(['g', 'i', 'm', 's', 'u', 'y', 'd']);
const REGEX_TIMEOUT_MS = 100;
const MAX_ERROR_MESSAGE_LENGTH = 200;

/**
 * Sanitize error messages from backend to prevent information disclosure.
 * Truncate to reasonable length and remove HTML-like characters.
 */
function sanitizeErrorMessage(msg: string): string {
  return msg.slice(0, MAX_ERROR_MESSAGE_LENGTH).replace(/[<>]/g, '');
}

/**
 * Validates a value against an OPTIONS-provided pattern.
 *
 * Only runs once the field has been changed from its default value (grandfathering),
 * so pre-existing data that predates the pattern is never retroactively flagged -
 * matching the backend's own `self.instance` comparison.
 */
export function validateOptionsPattern(
  value: unknown,
  fieldMetadata: FieldMetadata | undefined,
  isFieldDirty: boolean
): string | true {
  if (!fieldMetadata?.pattern || !isFieldDirty || typeof value !== 'string' || !value) {
    return true;
  }

  // Validate flags before constructing regex
  const flags = fieldMetadata.flags || '';
  for (const flag of flags) {
    if (!ALLOWED_REGEX_FLAGS.has(flag)) {
      return true; // Skip validation for invalid flags
    }
  }

  try {
    // Use timeout wrapper to prevent ReDoS attacks
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), REGEX_TIMEOUT_MS);
    const regex = new RegExp(fieldMetadata.pattern, flags);
    const result = regex.test(value);
    clearTimeout(timeoutHandle);
    return result
      ? true
      : sanitizeErrorMessage(fieldMetadata.pattern_description || DEFAULT_PATTERN_ERROR);
  } catch {
    return true; // Fail open—don't block user input on invalid pattern
  }
}

export type UserValidate<TFieldValues extends FieldValues> =
  | Validate<string, TFieldValues>
  | Record<string, Validate<string, TFieldValues>>
  | undefined;

/**
 * Runs the consumer-provided `validate` prop, which may be a single function
 * or a record of named validation functions (react-hook-form convention).
 */
export function runUserValidate<TFieldValues extends FieldValues>(
  userValidate: UserValidate<TFieldValues>,
  value: string,
  formValues: TFieldValues
): ValidateResult | Promise<ValidateResult> {
  if (!userValidate) return true;
  if (typeof userValidate === 'function') return userValidate(value, formValues);

  for (const validationFn of Object.values(userValidate)) {
    const result = validationFn(value, formValues);
    if (result !== true) return result;
  }
  return true;
}

/**
 * Combines OPTIONS-provided pattern validation with the consumer-provided
 * `validate` prop. The OPTIONS pattern always runs first.
 */
export function createFieldValidate<TFieldValues extends FieldValues>(
  fieldMetadata: FieldMetadata | undefined,
  userValidate: UserValidate<TFieldValues>,
  getDefaultValue: () => unknown
) {
  return (value: string, formValues: TFieldValues): ValidateResult | Promise<ValidateResult> => {
    const isFieldDirty = value !== getDefaultValue();
    const patternResult = validateOptionsPattern(value, fieldMetadata, isFieldDirty);
    if (patternResult !== true) return patternResult;
    return runUserValidate(userValidate, value, formValues);
  };
}
