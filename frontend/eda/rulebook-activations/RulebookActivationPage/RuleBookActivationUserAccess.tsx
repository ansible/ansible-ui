import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../main/EdaRoutes';

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
