import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { PulpItemsResponse } from '@ansible/hub-ui/common/useHubView';
import { PlatformResource } from '../interfaces/PlatformResource';

export function useHubResource<T extends object>(url: string, platformResource?: PlatformResource) {
  const { data, isLoading, error, refresh } = useGet<PulpItemsResponse<T>>(hubAPI`/${url}/`, {
    resource__ansible_id: platformResource?.summary_fields?.resource?.ansible_id ?? '',
  });
  const { results } = data ?? {};

  return {
    resource: results && results.length ? results[0] : undefined,
    isLoading,
    error,
    refresh,
  };
}

export async function getHubResource<T extends object>(
  url: string,
  platformResource?: PlatformResource
) {
  const data = await requestGet<PulpItemsResponse<T>>(
    hubAPI`/${url}?resource__ansible_id=${platformResource?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  const { results } = data ?? {};
  return results && results.length ? results[0] : undefined;
}
