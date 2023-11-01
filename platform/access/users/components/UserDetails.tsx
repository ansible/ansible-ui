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

export function UserDetails() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGetItem<User>('/api/gateway/v1/users', params.id);
  const { data: organizations } = user
    ? useGet<PlatformItemsResponse<Organization>>(user.related?.organizations)
    : { data: [] };
  const organizationNames = useMemo(() => {
    if (Array.isArray(organizations) && organizations.length > 0) {
      return organizations.map((organization: Organization) => organization.name);
    }
    return [];
  }, []);

  if (!user) {
    return null;
  }

  return (
    <UserDetailsBase
      user={user as UserDetailsType}
      organizationNames={organizationNames}
      options={{ showUserType: true }}
    />
  );
}
