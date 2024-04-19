import { useParams } from 'react-router-dom';
import { UserAccess } from '../../access/common/UserAccess';
import { EdaRoute } from '../../main/EdaRoutes';

export function RulebookActivationUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      id={params.id || ''}
      type={'activation'}
      addRolesRoute={EdaRoute.RulebookActivationAddUsers}
    />
  );
}
