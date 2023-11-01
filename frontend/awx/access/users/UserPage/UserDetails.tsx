/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useParams } from 'react-router-dom';
import { User } from '../../../interfaces/User';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { UserDetailsBase, UserDetailsType } from '../../../../common/access/UserDetailsBase';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Organization } from '../../../interfaces/Organization';
import { useMemo } from 'react';
import { useGetPageUrl } from '../../../../../framework';
import { AwxRoute } from '../../../AwxRoutes';

export function UserDetails() {
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: user } = useGetItem<User>('/api/v2/users', params.id);
  const itemsResponse = useGet<AwxItemsResponse<Organization>>(
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
        link: getPageUrl(AwxRoute.OrganizationDetails, {
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
    <>
      <UserDetailsBase
        user={user as UserDetailsType}
        organizations={organizations}
        options={{ showAuthType: true, showUserType: true }}
      />
    </>
  );
}
