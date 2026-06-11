const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

const LARGE_INT_PATTERN = /:\s*(-?\d{16,})(?=\s*[,})\]])/g;
const ARRAY_LARGE_INT_PATTERN = /\[\s*(-?\d{16,})(?=\s*[,\]])/g;
const ARRAY_ITEM_LARGE_INT_PATTERN = /,\s*(-?\d{16,})(?=\s*[,\]])/g;

const isLargeInteger = (value: string): boolean => {
  const num = value.replace(/^[-+]/, '');
  if (num.length < 16) return false;

  const asNumber = Number(value);
  if (!Number.isInteger(asNumber)) return false;

  return Math.abs(asNumber) > MAX_SAFE_INTEGER;
};

/**
 * Safely parses JSON by preserving large integer precision.
 *
 * JavaScript's Number type can only safely represent integers up to 2^53-1 (9007199254740991).
 * Standard JSON.parse() converts all numbers to JavaScript's Number type, causing precision
 * loss for integers exceeding this limit.
 *
 * This function detects large integers in JSON strings using regex patterns and converts them
 * to quoted strings before parsing, preserving their exact values.
 *
 * @param jsonString - JSON string to parse
 * @returns Parsed object with large integers preserved as strings, small integers as numbers
 *
 * @example
 * ```typescript
 * const json = '{"large": 12341234123412341234123412341235, "small": 123}';
 * const result = parseJSONPreservingLargeInts(json);
 * // result.large === '12341234123412341234123412341235' (string, precision preserved)
 * // result.small === 123 (number)
 * ```
 */
export function parseJSONPreservingLargeInts(jsonString: string): unknown {
  let processedJson = jsonString;

  processedJson = processedJson.replace(LARGE_INT_PATTERN, (match: string, number: string) => {
    if (isLargeInteger(number)) {
      return `: "${number}"`;
    }
    return match;
  });

  processedJson = processedJson.replace(
    ARRAY_LARGE_INT_PATTERN,
    (match: string, number: string) => {
      if (isLargeInteger(number)) {
        return `[ "${number}"`;
      }
      return match;
    }
  );

  processedJson = processedJson.replace(
    ARRAY_ITEM_LARGE_INT_PATTERN,
    (match: string, number: string) => {
      if (isLargeInteger(number)) {
        return `, "${number}"`;
      }
      return match;
    }
  );

  return JSON.parse(processedJson);
}

/**
 * Safely stringifies objects to JSON by serializing large integers without quotes.
 *
 * When large integers are stored as strings internally (to preserve precision),
 * standard JSON.stringify() would serialize them as quoted strings: "12345...".
 *
 * This function detects string representations of large integers and removes the quotes,
 * making them appear as native JSON numbers. This ensures compatibility with systems
 * that expect integer types (like Ansible/Python).
 *
 * @param obj - Object to serialize to JSON
 * @param space - Optional formatting parameter (same as JSON.stringify)
 * @returns JSON string with large integers serialized as unquoted numbers
 *
 * @example
 * ```typescript
 * const data = {
 *   large: '12341234123412341234123412341235', // string (precision preserved)
 *   small: 123 // number
 * };
 * const json = stringifyPreservingLargeInts(data, 2);
 * // Output:
 * // {
 * //   "large": 12341234123412341234123412341235,
 * //   "small": 123
 * // }
 * // (both appear as unquoted numbers in JSON)
 * ```
 */
export function stringifyPreservingLargeInts(obj: unknown, space?: string | number): string {
  let jsonString = JSON.stringify(obj, null, space);

  const STRING_INT_PATTERN = /"(-?\d{16,})"/g;

  jsonString = jsonString.replace(STRING_INT_PATTERN, (match: string, number: string) => {
    if (isLargeInteger(number)) {
      return number;
    }
    return match;
  });

  return jsonString;
}
