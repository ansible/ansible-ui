import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function NotificationUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="awx"
      id={params.id || ''}
      type={'awx.notificationtemplate'}
      addRolesRoute={AwxRoute.NotificationAddUsers as string}
      manageRoleRoute={AwxRoute.NotificationManageUsers}
    />
  );
}
