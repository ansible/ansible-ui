import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';
import { AwxRoute } from '../../../main/AwxRoutes';

export function ExecutionEnvironmentTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'executionenvironment'}
      addRolesRoute={AwxRoute.ExecutionEnvironmentAddTeams as string}
    />
  );
}
