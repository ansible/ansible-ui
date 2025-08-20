import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';
import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../../main/EdaRoutes';

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
