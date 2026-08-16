/**
 * Resolves a prompt field value based on the priority: resource (API data) > prompt (local state) > fallback.
 *
 * **Why this order matters:**
 * - `resource` contains fresh data from the API after save, including null for cleared fields
 * - `prompt` contains local wizard state that becomes stale after save
 * - Reading from prompt first would cause cleared fields (null in resource) to revert to template defaults
 *
 * **The !== undefined check:**
 * - Distinguishes between null (user cleared the field) and undefined (use template default)
 * - null ?? fallback would incorrectly use fallback instead of preserving the cleared state
 *
 * @param resource - Fresh API data from node.resource (nullable)
 * @param prompt - Local wizard state from node.launch_data (may be stale)
 * @param fallback - Default value to use when field is undefined in both sources
 * @returns Resolved value with null preserved for cleared fields
 */
export function resolvePromptField<T>(
  resource: T | null | undefined,
  prompt: T | null | undefined,
  fallback: T
): T | null {
  // For saved nodes: resource !== undefined means we have fresh API data (could be null for cleared)
  if (resource !== undefined) {
    return resource ?? fallback;
  }

  // For unsaved nodes or when resource doesn't have the field: fall back to local prompt state
  return prompt !== undefined ? (prompt ?? fallback) : fallback;
}
