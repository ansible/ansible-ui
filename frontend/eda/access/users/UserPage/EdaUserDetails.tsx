/* eslint-disable react/prop-types */
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { UserDetails, UserDetailsType } from '@ansible/common-ui/access/UserDetails';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router';
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
