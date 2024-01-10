/* eslint-disable react/prop-types */
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { UserDetails, UserDetailsType } from '../../../../common/access/UserDetails';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaUser } from '../../../interfaces/EdaUser';

export function EdaMyDetails() {
  const { data: user } = useGet<EdaUser>(edaAPI`/users/me/`);

  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <>
      <UserDetails user={user as UserDetailsType} />
    </>
  );
}
