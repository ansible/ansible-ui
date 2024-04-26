import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../common/TeamAccess';
import { EdaRoute } from '../../../main/EdaRoutes';

export function CredentialTypeTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      id={params.id || ''}
      type={'credentialtype'}
      addRolesRoute={EdaRoute.CredentialTypeAddTeams}
    />
  );
}
