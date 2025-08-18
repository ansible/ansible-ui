import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';

export function InventoryTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'awx.inventory'}
      addRolesRoute={AwxRoute.InventoryAssignTeams as string}
    />
  );
}
