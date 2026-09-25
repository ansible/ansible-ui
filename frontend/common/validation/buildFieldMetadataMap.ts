import type { FieldMetadata } from '@ansible/ansible-ui-framework/PageForm/PageFormOptionsContext';

/**
 * Shape of a schema field that may carry pattern validation metadata.
 *
 * This is intentionally minimal so the same builder works with:
 * - AWX `CredentialInputField` (keyed by `id`)
 * - EDA `EdaCredentialTypeField` (keyed by `id`)
 * - Platform `PluginConfiguration` (keyed by `name`)
 *
 * Some backends (notably the Gateway authenticator-plugins API) serialize
 * the description in camelCase (`patternDescription`) rather than
 * snake_case (`pattern_description`).  Both forms are accepted.
 */
export interface SchemaFieldWithPattern {
  /** Field identifier used as the lookup key. */
  id?: string;
  /** Alternative key used by authenticator plugin schemas. */
  name?: string;
  pattern?: string;
  pattern_description?: string;
  /** camelCase variant emitted by the Gateway authenticator-plugins API. */
  patternDescription?: string;
  flags?: string;
}

/**
 * Resolves the pattern description from a schema field, preferring
 * snake_case `pattern_description` over camelCase `patternDescription`.
 */
function resolvePatternDescription(field: SchemaFieldWithPattern): string | undefined {
  if (typeof field.pattern_description === 'string') return field.pattern_description;
  if (typeof field.patternDescription === 'string') return field.patternDescription;
  return undefined;
}

/**
 * Builds a `Record<string, FieldMetadata>` map from an array of schema
 * fields, suitable for passing to {@link PageFormFieldMetadataProvider}.
 *
 * Only fields that carry a `pattern` are included; fields without one
 * are skipped so the provider doesn't needlessly enlarge the context.
 *
 * Invalid regex patterns are silently skipped so a malformed backend
 * response doesn't break the form.
 *
 * @param fields - Array of schema field definitions (credential type
 *   inputs, plugin configuration schema, etc.)
 * @param keyProp - Which property to use as the map key (`'id'` for
 *   credential fields, `'name'` for authenticator plugin fields).
 *   Defaults to `'id'`.
 */
export function buildFieldMetadataMap(
  fields: readonly SchemaFieldWithPattern[] | undefined,
  keyProp: 'id' | 'name' = 'id'
): Record<string, FieldMetadata> {
  const map: Record<string, FieldMetadata> = {};

  if (!fields) return map;

  for (const field of fields) {
    const key = field[keyProp];
    const pattern = typeof field.pattern === 'string' ? field.pattern : undefined;

    if (!key || !pattern) continue;

    // Validate pattern syntax at build time so a bad regex from the
    // backend doesn't cause a runtime error inside the form validator.
    try {
      new RegExp(pattern);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(
          `buildFieldMetadataMap: skipping field "${key}" — invalid regex pattern: ${pattern}`
        );
      }
      continue;
    }

    const patternDescription = resolvePatternDescription(field);
    const flags = typeof field.flags === 'string' ? field.flags : undefined;

    map[key] = { pattern, pattern_description: patternDescription, flags };
  }

  return map;
}
