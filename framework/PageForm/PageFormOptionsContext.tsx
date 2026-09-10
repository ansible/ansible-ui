import { createContext, ReactNode, useContext, useMemo } from 'react';

/**
 * Field metadata extracted from OPTIONS responses
 */
export interface FieldMetadata {
  pattern?: string;
  pattern_description?: string;
  flags?: string;
}

/**
 * Shape of an individual field's metadata as it appears in a raw OPTIONS
 * response, before PageForm normalizes it into {@link FieldMetadata}.
 *
 * Some backends serialize the description in camelCase instead of snake_case.
 */
export interface PageFormOptionsFieldMetadata {
  pattern?: string;
  pattern_description?: string;
  patternDescription?: string;
  flags?: string;
}

/**
 * The OPTIONS response shape PageForm (and anything that wraps it, like
 * PageWizard) accepts via the `optionsData` prop. Forms pass the OPTIONS
 * response they already fetch; PageForm extracts field metadata from the
 * POST/PUT/PATCH actions and provides it via {@link PageFormOptionsContext}.
 */
export interface PageFormOptionsData {
  actions?: {
    POST?: Record<string, PageFormOptionsFieldMetadata>;
    PUT?: Record<string, PageFormOptionsFieldMetadata>;
    PATCH?: Record<string, PageFormOptionsFieldMetadata>;
  };
}

/**
 * Context for storing OPTIONS field metadata
 */
export interface PageFormOptionsContextValue {
  /**
   * Map of field names to their metadata from OPTIONS responses
   */
  fields: Record<string, FieldMetadata>;
}

/**
 * React context for OPTIONS-driven validation
 *
 * This context allows PageForm to provide field metadata from backend OPTIONS responses
 * to form inputs, enabling automatic validation pattern discovery.
 */
export const PageFormOptionsContext = createContext<PageFormOptionsContextValue>({
  fields: {},
});

/**
 * Extracts a flat `{ fieldName: FieldMetadata }` map from a raw OPTIONS
 * response's POST/PUT/PATCH actions. Only fields that carry a `pattern` or
 * `pattern_description` (snake_case or camelCase) are included.
 */
export function extractPageFormOptionsFields(
  optionsData: PageFormOptionsData | undefined
): Record<string, FieldMetadata> {
  const fields: Record<string, FieldMetadata> = {};

  if (!optionsData?.actions) return fields;

  const actions = [optionsData.actions.POST, optionsData.actions.PUT, optionsData.actions.PATCH];

  actions.forEach((action) => {
    if (!action) return;
    Object.entries(action).forEach(([fieldName, fieldMetadata]) => {
      const pattern = fieldMetadata.pattern;
      const patternDescription =
        fieldMetadata.pattern_description || fieldMetadata.patternDescription;
      const flags = fieldMetadata.flags;

      if (pattern || patternDescription) {
        fields[fieldName] = { pattern, pattern_description: patternDescription, flags };
      }
    });
  });

  return fields;
}

/**
 * Memoized version of {@link extractPageFormOptionsFields} for use inside
 * components that receive `optionsData` as a prop.
 */
export function usePageFormOptionsFields(
  optionsData: PageFormOptionsData | undefined
): Record<string, FieldMetadata> {
  return useMemo(() => extractPageFormOptionsFields(optionsData), [optionsData]);
}

/**
 * Establishes OPTIONS field metadata for whatever it wraps, given an
 * already-built `{ fieldName: FieldMetadata }` map. Unlike
 * {@link PageFormOptionsProvider}, this doesn't assume the metadata came from
 * a DRF-shaped OPTIONS response - any source (a credential type schema, a
 * notification type's nested field list, a plugin schema, etc.) can supply
 * `fields` directly, as long as it authors its own extraction into this shape.
 *
 * This is the primitive that lets any component in the tree - not just
 * PageForm/PageWizard - locally establish or layer on top of OPTIONS-driven
 * validation, which matters when different parts of one form correspond to
 * different backend resources (or when the relevant resource is only known
 * at runtime, e.g. after the user picks a type).
 */
export function PageFormFieldMetadataProvider(
  props: Readonly<{
    fields: Record<string, FieldMetadata>;
    /**
     * When true, layers `fields` on top of the ambient context instead of
     * replacing it. Own fields win on name collisions. Useful when a nested
     * component contributes metadata for a second resource alongside whatever
     * an enclosing PageForm/PageWizard already provides.
     */
    merge?: boolean;
    children: ReactNode;
  }>
) {
  const parent = useContext(PageFormOptionsContext);
  const value = useMemo<PageFormOptionsContextValue>(() => {
    if (!props.merge) return { fields: props.fields };
    return { fields: { ...parent.fields, ...props.fields } };
  }, [props.fields, props.merge, parent.fields]);

  return (
    <PageFormOptionsContext.Provider value={value}>
      {props.children}
    </PageFormOptionsContext.Provider>
  );
}

/**
 * Convenience wrapper around {@link PageFormFieldMetadataProvider} for the
 * common case of a raw DRF-shaped OPTIONS response. This is what
 * `PageForm`/`PageWizard` use internally for their `optionsData` prop; other
 * components with a differently-shaped metadata source should build their
 * own `fields` map and use `PageFormFieldMetadataProvider` directly.
 */
export function PageFormOptionsProvider(
  props: Readonly<{
    optionsData?: PageFormOptionsData;
    merge?: boolean;
    children: ReactNode;
  }>
) {
  const fields = usePageFormOptionsFields(props.optionsData);
  return (
    <PageFormFieldMetadataProvider fields={fields} merge={props.merge}>
      {props.children}
    </PageFormFieldMetadataProvider>
  );
}

/**
 * Hook to access OPTIONS field metadata for a specific field.
 *
 * Form field `name`s are often namespaced/nested for form-state organization
 * (e.g. `organization.name`, `prompt.limit`) even though the backend's
 * OPTIONS response describes the bare serializer field name (`name`,
 * `limit`). By default this looks up the last dot-separated segment of
 * `name` so those line up without any extra wiring; pass `optionsFieldName`
 * to override the lookup key explicitly when that heuristic would be wrong
 * or ambiguous (e.g. two differently-prefixed fields in the same form both
 * ending in `.name`).
 *
 * @param name - The form field's `name` (may be dotted/nested)
 * @param optionsFieldName - Explicit backend field name to look up, overriding the default heuristic
 * @returns Field metadata if found, otherwise undefined
 */
export function usePageFormOptionsContext(
  name: string,
  optionsFieldName?: string
): FieldMetadata | undefined {
  const context = useContext(PageFormOptionsContext);
  const lookupKey = optionsFieldName ?? name.split('.').pop() ?? name;
  return context.fields[lookupKey];
}
