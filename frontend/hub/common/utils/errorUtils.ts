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
