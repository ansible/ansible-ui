import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../common/ResourceAccess';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaUserRoles() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess id={params.id || ''} type="user-roles" addRolesRoute={EdaRoute.UserAddRoles} />
  );
}
