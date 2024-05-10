import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaTeamRoles() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service={'eda'}
      id={params.id || ''}
      type="team-roles"
      addRolesRoute={EdaRoute.TeamAddRoles}
    />
  );
}
