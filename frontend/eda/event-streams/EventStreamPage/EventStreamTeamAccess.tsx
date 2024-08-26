import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';
import { TeamAccess } from '../../../common/access/components/TeamAccess';

export function EventStreamTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="eda"
      id={params.id || ''}
      type={'eventstream'}
      addRolesRoute={EdaRoute.EventStreamAddTeams}
    />
  );
}
