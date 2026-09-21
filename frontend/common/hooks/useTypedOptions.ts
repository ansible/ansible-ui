import { useOptions } from '@ansible/common-ui/crud/useOptions';
import type { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';

/**
 * Safely typed wrapper around useOptions that provides better type safety
 * for OPTIONS responses, eliminating TypeScript unsafe assignment warnings.
 *
 * Use this instead of useOptions<OptionsResponse<T>> to get proper type narrowing
 * without eslint-disable comments.
 *
 * @template T - The ActionsResponse type (defaults to ActionsResponse)
 * @param url - The OPTIONS endpoint URL
 * @returns Query result with properly typed OPTIONS data
 *
 * @example
 * const { data: optionsData } = useTypedOptions<ActionsResponse>(gatewayAPI`/teams/`);
 */
export function useTypedOptions<T extends ActionsResponse = ActionsResponse>(url: string) {
  return useOptions<OptionsResponse<T>>(url);
}
