import { useParams } from 'react-router';
import { EdaRoute } from '../../../main/EdaRoutes';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';

export function CredentialTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'eda.edacredential'}
      addRolesRoute={EdaRoute.CredentialAssignTeams}
    />
  );
}
