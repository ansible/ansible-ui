import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function CredentialTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'credential'}
      addRolesRoute={AwxRoute.CredentialAssignTeams as string}
    />
  );
}
