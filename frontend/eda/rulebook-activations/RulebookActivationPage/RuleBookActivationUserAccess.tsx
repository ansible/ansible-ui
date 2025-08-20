import { useParams } from 'react-router-dom';
import { ResourceUserAccess } from '../../../common/access/components/ResourceUserAccess';
import { EdaRoute } from '../../main/EdaRoutes';

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
