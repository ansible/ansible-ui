import jsyaml from 'js-yaml';

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

const LARGE_INT_PATTERN = /:([ \t]*)(-?\d{17,})[ \t]*$/gm;
const ARRAY_LARGE_INT_PATTERN = /^([ \t]*-[ \t]+)(-?\d{17,})[ \t]*$/gm;

const isLargeInteger = (value: string): boolean => {
  const num = value.replace(/^[-+]/, '');
  if (num.length < 17) return false;
  const asNumber = Number(value);
  return Number.isInteger(asNumber) && Math.abs(asNumber) > MAX_SAFE_INTEGER;
};

/**
 * Safely loads YAML by preserving large integer precision.
 *
 * JavaScript's Number type can only safely represent integers up to 2^53-1 (9007199254740991).
 * Larger integers lose precision and may be converted to scientific notation.
 *
 * This function detects integers exceeding JavaScript's safe integer limit and preserves
 * them as strings internally while maintaining their appearance as unquoted integers in YAML.
 *
 * @param input - YAML string to parse
 * @returns Parsed object with large integers preserved as strings
 *
 * @example
 * ```typescript
 * const yaml = `
 *   number_list:
 *     - 12341234123412341234123412341235
 *     - 123
 * `;
 * const result = safeLoad(yaml);
 * // result.number_list[0] === '12341234123412341234123412341235' (string)
 * // result.number_list[1] === 123 (number)
 * ```
 */
export function safeLoad(input: string): unknown {
  let processedYaml = input;

  processedYaml = processedYaml.replace(
    LARGE_INT_PATTERN,
    (match: string, space: string, number: string) => {
      if (isLargeInteger(number)) {
        return `:${space}"${number}"`;
      }
      return match;
    }
  );

  processedYaml = processedYaml.replace(
    ARRAY_LARGE_INT_PATTERN,
    (match: string, prefix: string, number: string) => {
      if (isLargeInteger(number)) {
        return `${prefix}"${number}"`;
      }
      return match;
    }
  );

  return jsyaml.load(processedYaml);
}

/**
 * Safely dumps objects to YAML by serializing large integers without quotes.
 *
 * When large integers are stored as strings internally (to preserve precision),
 * this function ensures they are serialized as unquoted integers in the YAML output,
 * making them valid for systems like Ansible/Python that expect native integer types.
 *
 * Small integers stored as JavaScript numbers are serialized normally.
 *
 * @param obj - Object to serialize to YAML
 * @returns YAML string with large integers serialized as unquoted integers
 *
 * @example
 * ```typescript
 * const data = {
 *   large: '12341234123412341234123412341235', // string (precision preserved)
 *   small: 123 // number
 * };
 * const yaml = safeDump(data);
 * // Output:
 * // large: 12341234123412341234123412341235
 * // small: 123
 * // (both appear as unquoted integers, no quotes in YAML)
 * ```
 */
export function safeDump(obj: unknown): string {
  let yaml = jsyaml.dump(obj);

  const STRING_INT_PATTERN = /['"](-?\d{17,})['"]/g;

  yaml = yaml.replace(STRING_INT_PATTERN, (match: string, number: string) => {
    if (isLargeInteger(number)) {
      return number;
    }
    return match;
  });

  return yaml;
}
