import { AwxRoute } from '../../../main/AwxRoutes';
import { useParams } from 'react-router-dom';
import { UserAccess } from '../../../../common/access/components/UserAccess';

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
