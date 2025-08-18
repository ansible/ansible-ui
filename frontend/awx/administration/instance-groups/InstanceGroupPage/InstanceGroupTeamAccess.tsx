import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';

export function InstanceGroupTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'awx.instancegroup'}
      addRolesRoute={AwxRoute.InstanceGroupAssignTeams}
    />
  );
}
