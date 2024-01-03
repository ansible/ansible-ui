import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../../../framework';
import { UserDetails, UserDetailsType } from '../../../../frontend/common/access/UserDetails';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformRoute } from '../../../PlatformRoutes';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';

export function PlatformUserDetails() {
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: user } = useGetItem<PlatformUser>(gatewayAPI`/v1/users`, params.id);
  const itemsResponse = useGet<PlatformItemsResponse<PlatformOrganization>>(
    user?.related?.organizations as string
  );
  const organizations = useMemo<
    {
      name: string;
      link: string;
    }[]
  >(() => {
    if (itemsResponse?.data?.results) {
      return itemsResponse?.data?.results.map((organization: PlatformOrganization) => ({
        name: organization.name,
        link: getPageUrl(PlatformRoute.OrganizationDetails, {
          params: { id: organization.id },
        }),
      }));
    }
    return [];
  }, [getPageUrl, itemsResponse?.data?.results]);

  if (!user) {
    return null;
  }

  return (
    <UserDetails
      user={user as UserDetailsType}
      organizations={organizations}
      options={{ showUserType: true }}
    />
  );
}
