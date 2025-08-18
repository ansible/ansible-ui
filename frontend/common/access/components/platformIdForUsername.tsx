import { useGet } from '@ansible/common-ui/crud/useGet';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';

export function PlatformIdForUsername(username: string) {
  const { data } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/`,
    { username: username },
    { dedupingInterval: 10 * 1000 }
  );

  return data?.results && data.results.length > 0 ? data.results[0].id : undefined;
}
