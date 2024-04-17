import { useParams } from 'react-router-dom';
import { UserAccess } from '../../access/common/UserAccess';
import { EdaRoute } from '../../main/EdaRoutes';

export function DecisionEnvironmentUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      id={params.id || ''}
      type={'decisionenvironment'}
      addRolesRoute={EdaRoute.DecisionEnvironmentAddUsers}
    />
  );
}
