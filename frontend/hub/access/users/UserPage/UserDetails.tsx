/* eslint-disable react/prop-types */
import { useParams } from 'react-router-dom';
import { LoadingState } from '../../../../../framework/components/LoadingState';
import {
  UserDetails as CommonUserDetails,
  UserDetailsType,
} from '../../../../common/access/UserDetails';
import { useGet } from '../../../../common/crud/useGet';
import { hubAPI } from '../../../common/api/formatPath';
import { HubUser } from '../../../interfaces/expanded/HubUser';

export function UserDetails() {
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<HubUser>(params.id ? hubAPI`/_ui/v1/users/${params.id}/` : null);

  if (!user) return <LoadingState />;

  return (
    <>
      <CommonUserDetails user={user as UserDetailsType} />
    </>
  );
}
