/* eslint-disable react/prop-types */
import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { UserDetailsBase, UserDetailsType } from '../../../../common/access/UserDetailsBase';
import { useGet } from '../../../../common/crud/useGet';
import { SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaUser } from '../../../interfaces/EdaUser';
import { edaAPI } from '../../../api/eda-utils';

export function UserDetails() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(edaAPI`/users/${params.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });
  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <>
      <UserDetailsBase user={user as UserDetailsType} />
    </>
  );
}
