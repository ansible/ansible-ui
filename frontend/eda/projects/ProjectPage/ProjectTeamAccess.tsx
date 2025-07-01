import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useParams } from 'react-router';
import { EdaRoute } from '../../main/EdaRoutes';

export function ProjectTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="eda"
      id={params.id || ''}
      type={'project'}
      addRolesRoute={EdaRoute.ProjectAssignTeams}
    />
  );
}
