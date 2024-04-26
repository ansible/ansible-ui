import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';
import { UserAccess } from '../../../common/access/components/UserAccess';

export function RulebookActivationUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="eda"
      id={params.id || ''}
      type={'activation'}
      addRolesRoute={EdaRoute.RulebookActivationAddUsers}
    />
  );
}
