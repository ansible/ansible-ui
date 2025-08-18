import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';

export function NotificationTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'awx.notificationtemplate'}
      addRolesRoute={AwxRoute.NotificationAssignTeams as string}
    />
  );
}
