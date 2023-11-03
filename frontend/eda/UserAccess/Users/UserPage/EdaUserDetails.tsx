/* eslint-disable react/prop-types */
import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { UserDetails, UserDetailsType } from '../../../../common/access/UserDetails';
import { useGet } from '../../../../common/crud/useGet';
import { SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaUser } from '../../../interfaces/EdaUser';
import { edaAPI } from '../../../api/eda-utils';

export function EdaUserDetails() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(edaAPI`/users/${params.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });
  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <>
      <UserDetails user={user as UserDetailsType} />
    </>
  );
}
