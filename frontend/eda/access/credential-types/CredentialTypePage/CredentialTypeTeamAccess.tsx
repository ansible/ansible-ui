import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../../main/EdaRoutes';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';

export function CredentialTypeTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="eda"
      id={params.id || ''}
      type={'credentialtype'}
      addRolesRoute={EdaRoute.CredentialTypeAddTeams as string}
    />
  );
}
