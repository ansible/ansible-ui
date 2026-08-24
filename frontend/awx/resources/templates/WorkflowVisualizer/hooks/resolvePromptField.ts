/**
 * Resolves a prompt field value based on the priority: prompt (in-session edits) > resource (API data) > fallback.
 *
 * **Why this order matters:**
 * - `prompt` (launch_data) contains in-session wizard edits, including cleared fields (`''`, `0`, `false`)
 * - `resource` contains pre-edit API data that becomes stale after user edits in the wizard
 * - Reading from resource first would discard in-session edits when reopening the wizard
 *
 * **The !== undefined check:**
 * - Preserves defined prompt values including falsy ones (`''`, `0`, `false`)
 * - Only falls back to `resource` when `prompt === undefined` (field not edited in this session)
 * - This maintains the original `prompt ?? defaults` semantics but with proper null handling
 *
 * @param resource - API data from node.resource (may be stale after in-session edits)
 * @param prompt - In-session wizard state from node.launch_data (current edits)
 * @param fallback - Default value to use when both sources are undefined
 * @returns Resolved value preserving in-session edits
 */
export function resolvePromptField<T>(
  resource: T | null | undefined,
  prompt: T | null | undefined,
  fallback: T
): T {
  // Prefer defined prompt values (including '', 0, false) to preserve in-session edits
  if (prompt !== undefined) {
    return prompt ?? fallback;
  }

  // Fall back to resource only when prompt is undefined (field not edited in this session)
  if (resource !== undefined) {
    return resource ?? fallback;
  }

  // Use fallback when both are undefined
  return fallback;
}
