import { useParams } from 'react-router-dom';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import {
  UserDetailsBase,
  UserDetailsType,
} from '../../../../frontend/common/access/UserDetailsBase';
import { User } from '../../../interfaces/User';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { Organization } from '../../../interfaces/Organization';
import { useEffect, useMemo } from 'react';
import { useGetPageUrl } from '../../../../framework';
import { PlatformRoute } from '../../../PlatformRoutes';

export function UserDetails() {
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: user } = useGetItem<User>('/api/gateway/v1/users', params.id);
  const itemsResponse = useGet<PlatformItemsResponse<Organization>>(
    user?.related?.organizations as string
  );
  const organizations = useMemo<
    {
      name: string;
      link: string;
    }[]
  >(() => {
    if (itemsResponse?.data?.results) {
      return itemsResponse?.data?.results.map((organization: Organization) => ({
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
    <UserDetailsBase
      user={user as UserDetailsType}
      organizations={organizations}
      options={{ showUserType: true }}
    />
  );
}
