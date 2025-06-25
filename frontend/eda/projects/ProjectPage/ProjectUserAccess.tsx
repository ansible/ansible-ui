import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useParams } from 'react-router';
import { EdaRoute } from '../../main/EdaRoutes';

export function ProjectUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="eda"
      id={params.id || ''}
      type={'project'}
      addRolesRoute={EdaRoute.ProjectAddUsers}
    />
  );
}
