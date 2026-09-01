import { createContext, useContext } from 'react';

/**
 * Field metadata extracted from OPTIONS responses
 */
export interface FieldMetadata {
  pattern?: string;
  pattern_description?: string;
  flags?: string;
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
 * Hook to access OPTIONS field metadata for a specific field
 *
 * @param fieldName - The name of the field to look up
 * @returns Field metadata if found, otherwise undefined
 */
export function usePageFormOptionsContext(fieldName: string): FieldMetadata | undefined {
  const context = useContext(PageFormOptionsContext);
  return context.fields[fieldName];
}
