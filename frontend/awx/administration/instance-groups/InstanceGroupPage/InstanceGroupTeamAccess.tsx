import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';

export function InstanceGroupTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'instancegroup'}
      addRolesRoute={AwxRoute.InstanceGroupAddTeams}
    />
  );
}
