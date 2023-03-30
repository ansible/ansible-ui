import { useGet } from './useGet';

/**
 * useGetItem
 *
 * Helper function that returns an item.
 *
 * Useful as 'id' is optional allowing for it to be used with useParams  */
export function useGetItem<T = unknown>(url: string, id?: string | number) {
  if (url.endsWith('/')) url = url.substring(url.length - 1);
  return useGet<T>(id ? `${url}/${id}/` : undefined);
}
