import { useGet } from '../../frontend/common/crud/useGet';
import { awxAPI } from '../../frontend/awx/common/api/awx-utils';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { PlatformResource } from '../interfaces/PlatformResource';

export function useAwxResource<T extends object>(url: string, platformResource?: PlatformResource) {
  const { data, isLoading, error } = useGet<AwxItemsResponse<T>>(
    awxAPI`/${url}?resource__ansible_id=${platformResource?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  const { results } = data ?? {};

  return {
    resource: results && results.length ? results[0] : undefined,
    isLoading,
    error,
  };
}