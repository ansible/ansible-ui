import { useGet } from '@ansible/common-ui/crud/useGet';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';

export interface RoleType {
  api_slug: string;
  service: string;
  app_label: string;
  model: string;
  parent_content_type: string | null;
  pk_field_type: string;
}

/**
 * Hook to fetch all role-types from the gateway.
 */
export function useGetResourceTypes() {
  const { data, error, isLoading } = useGet<PlatformItemsResponse<RoleType>>(
    gatewayAPI`/service-index/role-types/`
  );
  return { data, error, isLoading };
}
