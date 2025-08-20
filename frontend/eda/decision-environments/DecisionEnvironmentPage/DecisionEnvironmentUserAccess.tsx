import { useParams } from 'react-router-dom';
import { ResourceUserAccess } from '../../../common/access/components/ResourceUserAccess';
import { EdaRoute } from '../../main/EdaRoutes';

export function DecisionEnvironmentUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="eda"
      id={params.id || ''}
      type={'eda.decisionenvironment'}
      manageRoleRoute={EdaRoute.DecisionEnvironmentManageUsers}
      addRolesRoute={EdaRoute.DecisionEnvironmentAddUsers}
    />
  );
}
