/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../../../../framework';
import { UserDetails, UserDetailsType } from '../../../../common/access/UserDetails';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { AwxRoute } from '../../../main/AwxRoutes';

export function AwxUserDetails() {
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: user } = useGetItem<AwxUser>(awxAPI`/users`, params.id);
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
      <UserDetails
        user={user as UserDetailsType}
        organizations={organizations}
        options={{ showAuthType: true, showUserType: true }}
      />
    </>
  );
}
