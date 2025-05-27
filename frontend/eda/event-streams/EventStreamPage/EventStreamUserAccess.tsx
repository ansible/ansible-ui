import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';

export function EventStreamUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="eda"
      id={params.id || ''}
      type={'eventstream'}
      addRolesRoute={EdaRoute.EventStreamAddUsers}
    />
  );
}
