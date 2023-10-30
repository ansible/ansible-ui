/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useParams } from 'react-router-dom';
import { User } from '../../../interfaces/User';
import { useGetItem } from '../../../../common/crud/useGet';
import { UserDetailsBase, UserDetailsType } from '../../../../common/access/UserDetailsBase';

export function UserDetails() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGetItem<User>('/api/v2/users', params.id);

  if (!user) {
    return null;
  }

  return (
    <>
      <UserDetailsBase
        user={user as UserDetailsType}
        options={{ showAuthType: true, showUserType: true }}
      />
    </>
  );
}
