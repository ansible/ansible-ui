import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';

export function EventStreamUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="eda"
      id={params.id || ''}
      type={'eda.eventstream'}
      addRolesRoute={EdaRoute.EventStreamAddUsers}
      manageRoleRoute={EdaRoute.EventStreamManageUsers}
    />
  );
}
