import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';

export function NotificationUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'notificationtemplate'}
      addRolesRoute={AwxRoute.NotificationAddUsers as string}
    />
  );
}
