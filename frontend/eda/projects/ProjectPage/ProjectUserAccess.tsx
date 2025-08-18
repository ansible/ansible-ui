import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useParams } from 'react-router';
import { EdaRoute } from '../../main/EdaRoutes';

export function ProjectUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="eda"
      id={params.id || ''}
      type={'eda.project'}
      addRolesRoute={EdaRoute.ProjectAddUsers}
      manageRoleRoute={EdaRoute.ProjectManageUsers}
    />
  );
}
