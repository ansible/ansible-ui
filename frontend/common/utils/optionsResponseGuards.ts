import type { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';

/**
 * Validates that a value matches the top-level OptionsResponse structure.
 * Only validates required top-level fields: name, description, and actions object.
 * Does not validate individual field definitions inside actions.* since those
 * are completely endpoint-specific.
 */
export function isOptionsResponse(value: unknown): value is OptionsResponse<ActionsResponse> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Validate required top-level fields
  if (typeof obj.name !== 'string' || typeof obj.description !== 'string') {
    return false;
  }

  // Validate actions structure if present
  // The structure should be: { POST: {...}, GET: {...}, etc }
  if (obj.actions !== undefined && obj.actions !== null) {
    if (typeof obj.actions !== 'object') {
      return false;
    }

    // Validate that each HTTP method (POST, GET, PATCH, etc) maps to an object
    const actionsObj = obj.actions as Record<string, unknown>;
    for (const actionType of Object.values(actionsObj)) {
      if (typeof actionType !== 'object' || actionType === null) {
        return false;
      }
    }
  }

  return true;
}
