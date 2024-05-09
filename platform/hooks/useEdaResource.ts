import { useGet } from '../../frontend/common/crud/useGet';
import { edaAPI } from '../../frontend/eda/common/eda-utils';
import { EdaItemsResponse } from '../../frontend/eda/common/EdaItemsResponse';
import { PlatformResource } from '../interfaces/PlatformResource';

export function useEdResource<T extends object>(url: string, platformResource?: PlatformResource) {
  const { data, isLoading, error } = useGet<EdaItemsResponse<T>>(
    edaAPI`/${url}?resource__ansible_id=${platformResource?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  const { results } = data ?? {};

  return {
    resource: results && results.length ? results[0] : undefined,
    isLoading,
    error,
  };
}
