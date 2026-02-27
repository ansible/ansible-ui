import { RequestError } from '@ansible/common-ui/crud/RequestError';

/**
 * Check if an error is an access denied (403 Forbidden) error.
 *
 * This is deployment-agnostic and works for both:
 * - Platform (AAP Gateway) deployments with Gateway RBAC
 * - Insights (CRC) deployments with Pulp RBAC
 *
 * @param error - The error to check
 * @returns true if the error indicates access denied (403 Forbidden)
 */
export function isAccessDeniedError(error: Error | undefined): boolean {
  if (!error) return false;

  // Check for RequestError with 403 status code
  if (error instanceof RequestError && error.statusCode === 403) {
    return true;
  }

  // Also check for common 403 error messages (fallback for non-RequestError cases)
  const message = error.message?.toLowerCase() || '';
  return message.includes('forbidden') || message.includes('403');
}

/**
 * Extract a human-readable error description from an error.
 *
 * Handles Galaxy errors ({errors: [{detail, title}]}), Pulp errors
 * ({detail: string}), Django REST errors ({non_field_errors: string[]}),
 * and falls back to generic object stringification.
 *
 * @param error - The error to extract a description from
 * @returns A formatted error string suitable for display in alerts/toasts
 */
export function extractErrorDescription(error: unknown): string {
  if (!(error instanceof RequestError) || !error.json || typeof error.json !== 'object') {
    return error instanceof Error ? error.message : String(error);
  }

  const data = error.json as Record<string, unknown>;
  const statusCode = error.statusCode;
  const statusText = error.message;

  let detail = '';

  if ('errors' in data && Array.isArray(data.errors)) {
    detail = (data.errors as Array<{ detail?: string; title?: string }>)
      .map((e) => e.detail || e.title)
      .filter(Boolean)
      .join(' ');
  } else if ('detail' in data && typeof data.detail === 'string') {
    detail = data.detail;
  } else if ('non_field_errors' in data && Array.isArray(data.non_field_errors)) {
    detail = (data.non_field_errors as string[]).join(' ');
  } else {
    detail = Object.values(data)
      .map((v) => (Array.isArray(v) ? v.join(' ') : String(v)))
      .join(' ');
  }

  const prefix = `Error ${statusCode} - ${statusText}`;
  return detail ? `${prefix}: ${detail}` : prefix;
}
