import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformResource } from '../interfaces/PlatformResource';

export function useAwxResource<T extends object>(url: string, platformResource?: PlatformResource) {
  const { data, isLoading, error, refresh } = useGet<AwxItemsResponse<T>>(
    awxAPI`/${url}?resource__ansible_id=${platformResource?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  const { results } = data ?? {};

  return {
    resource: results && results.length ? results[0] : undefined,
    isLoading,
    error,
    refresh,
  };
}

export async function getAwxResource<T extends object>(
  url: string,
  platformResource?: PlatformResource
) {
  const data = await requestGet<AwxItemsResponse<T>>(
    awxAPI`/${url}?resource__ansible_id=${platformResource?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  const { results } = data ?? {};
  return results && results.length ? results[0] : undefined;
}
