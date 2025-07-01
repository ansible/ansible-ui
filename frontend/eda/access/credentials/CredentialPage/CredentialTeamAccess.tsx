import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useParams } from 'react-router';
import { EdaRoute } from '../../../main/EdaRoutes';

export function CredentialTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="eda"
      id={params.id || ''}
      type={'edacredential'}
      addRolesRoute={EdaRoute.CredentialAssignTeams}
    />
  );
}
