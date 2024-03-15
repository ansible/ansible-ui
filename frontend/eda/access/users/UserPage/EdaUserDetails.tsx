/* eslint-disable react/prop-types */
import { useParams } from 'react-router-dom';
import { LoadingState } from '../../../../../framework/components/LoadingState';
import { UserDetails, UserDetailsType } from '../../../../common/access/UserDetails';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaUser } from '../../../interfaces/EdaUser';

export function EdaUserDetails() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(params.id ? edaAPI`/users/${params.id}/` : null);
  if (!user) return <LoadingState />;

  return (
    <>
      <UserDetails user={user as UserDetailsType} />
    </>
  );
}
