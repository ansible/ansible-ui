import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../access/common/TeamAccess';
import { EdaRoute } from '../../main/EdaRoutes';

export function RulebookActivationTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      id={params.id || ''}
      type={'activation'}
      addRolesRoute={EdaRoute.RulebookActivationAddTeams}
    />
  );
}
