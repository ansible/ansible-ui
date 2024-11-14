import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { EdaItemsResponse } from '@ansible/eda-ui/common/EdaItemsResponse';
import { PlatformResource } from '../interfaces/PlatformResource';

export function useEdaResource<T extends object>(url: string, platformResource?: PlatformResource) {
  const { data, isLoading, error, refresh } = useGet<EdaItemsResponse<T>>(
    edaAPI`/${url}?resource__ansible_id=${platformResource?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  const { results } = data ?? {};

  return {
    resource: results && results.length ? results[0] : undefined,
    isLoading,
    error,
    refresh,
  };
}

export async function getEdaResource<T extends object>(
  url: string,
  platformResource?: PlatformResource
) {
  const data = await requestGet<EdaItemsResponse<T>>(
    edaAPI`/${url}?resource__ansible_id=${platformResource?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  const { results } = data ?? {};
  return results && results.length ? results[0] : undefined;
}
