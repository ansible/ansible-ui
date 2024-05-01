import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';
import { TeamAccess } from '../../../common/access/components/TeamAccess';

export function ProjectTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="eda"
      id={params.id || ''}
      type={'project'}
      addRolesRoute={EdaRoute.ProjectAddTeams}
    />
  );
}
