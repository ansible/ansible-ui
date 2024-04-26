import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';

export function UserRoles() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service="awx"
      id={params.id || ''}
      type="user-roles"
      addRolesRoute={AwxRoute.AddRolesToUser}
    />
  );
}
