import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';
import { AwxRoute } from '../../../main/AwxRoutes';

export function InventoryTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'inventory'}
      addRolesRoute={AwxRoute.InventoryAddTeams as string}
    />
  );
}
