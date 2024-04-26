import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../../main/EdaRoutes';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';

export function EdaUserRoles() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service="eda"
      id={params.id || ''}
      type="user-roles"
      addRolesRoute={EdaRoute.UserAddRoles}
    />
  );
}
