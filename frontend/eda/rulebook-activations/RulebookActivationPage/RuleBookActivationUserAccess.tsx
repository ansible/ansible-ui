import { useParams } from 'react-router';
import { EdaRoute } from '../../main/EdaRoutes';
import { ResourceUserAccess } from '../../../common/access/components/ResourceUserAccess';

export function RulebookActivationUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="eda"
      id={params.id || ''}
      type={'eda.activation'}
      addRolesRoute={EdaRoute.RulebookActivationAddUsers}
      manageRoleRoute={EdaRoute.RulebookActivationManageUsers}
    />
  );
}
