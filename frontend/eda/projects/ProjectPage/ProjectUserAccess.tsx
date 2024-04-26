import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';
import { UserAccess } from '../../../common/access/components/UserAccess';

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
