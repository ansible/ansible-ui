import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

interface IPlatformUsers {
  platformUser?: PlatformUser;
  isLoading: boolean;
  error?: Error;
}

export function useGetPlatformUsers(userId: number): IPlatformUsers {
  const {
    data: platformUser,
    isLoading,
    error,
  } = useGet<PlatformUser>(gatewayAPI`/users/${userId.toString()}/`);

  return {
    platformUser,
    isLoading,
    error,
  };
}
