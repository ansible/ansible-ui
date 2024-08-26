import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';
import { UserAccess } from '../../../common/access/components/UserAccess';

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
