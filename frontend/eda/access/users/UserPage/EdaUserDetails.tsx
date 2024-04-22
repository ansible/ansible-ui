/* eslint-disable react/prop-types */
import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { UserDetails, UserDetailsType } from '../../../../common/access/UserDetails';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaUser } from '../../../interfaces/EdaUser';

export function EdaUserDetails() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(edaAPI`/users/${params.id ?? ''}/`);
  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <>
      <UserDetails user={user as UserDetailsType} options={{ showUserType: true }} />
    </>
  );
}
