import { useParams } from 'react-router-dom';
import { UserAccess } from '../../common/UserAccess';
import { EdaRoute } from '../../../main/EdaRoutes';

export function CredentialUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      id={params.id || ''}
      type={'edacredential'}
      addRolesRoute={EdaRoute.CredentialAddUsers}
    />
  );
}
