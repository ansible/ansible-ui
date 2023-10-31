/* eslint-disable react/prop-types */
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { UserDetailsBase, UserDetailsType } from '../../../../common/access/UserDetailsBase';
import { useGet } from '../../../../common/crud/useGet';
import { API_PREFIX } from '../../../constants';
import { EdaUser } from '../../../interfaces/EdaUser';

export function MyDetails() {
  const { data: user } = useGet<EdaUser>(`${API_PREFIX}/users/me/`);

  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <>
      <UserDetailsBase user={user as UserDetailsType} />
    </>
  );
}
