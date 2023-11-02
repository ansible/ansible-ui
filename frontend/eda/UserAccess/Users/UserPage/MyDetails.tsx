/* eslint-disable react/prop-types */
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { UserDetailsBase, UserDetailsType } from '../../../../common/access/UserDetailsBase';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../api/eda-utils';
import { EdaUser } from '../../../interfaces/EdaUser';

export function MyDetails() {
  const { data: user } = useGet<EdaUser>(edaAPI`/users/me/`);

  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <>
      <UserDetailsBase user={user as UserDetailsType} />
    </>
  );
}
