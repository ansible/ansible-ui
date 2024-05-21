/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useParams } from 'react-router-dom';
import { UserAccess } from '../../../../common/access/components/UserAccess';
import { AwxRoute } from '../../../main/AwxRoutes';
export function OrganizationUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'organization'}
      addRolesRoute={AwxRoute.OrganizationAddUsers}
    />
  );
}
