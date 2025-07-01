import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';

export function NotificationTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'notificationtemplate'}
      addRolesRoute={AwxRoute.NotificationAssignTeams as string}
    />
  );
}
