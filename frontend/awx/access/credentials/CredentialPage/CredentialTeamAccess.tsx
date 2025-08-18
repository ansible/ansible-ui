import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';

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
