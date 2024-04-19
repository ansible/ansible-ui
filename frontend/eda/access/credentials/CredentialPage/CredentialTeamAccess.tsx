import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../common/TeamAccess';
import { EdaRoute } from '../../../main/EdaRoutes';

export function CredentialTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      id={params.id || ''}
      type={'edacredential'}
      addRolesRoute={EdaRoute.CredentialAddTeams}
    />
  );
}
