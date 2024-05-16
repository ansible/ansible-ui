import { AwxRoute } from '../../../main/AwxRoutes';
import { useParams } from 'react-router-dom';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';

export function NotificationTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'notificationtemplate'}
      addRolesRoute={AwxRoute.NotificationAddTeams as string}
    />
  );
}
