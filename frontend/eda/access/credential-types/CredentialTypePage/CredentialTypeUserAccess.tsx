import { useParams } from 'react-router-dom';
import { UserAccess } from '../../common/UserAccess';
import { EdaRoute } from '../../../main/EdaRoutes';

export function CredentialTypeUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      id={params.id || ''}
      type={'credentialtype'}
      addRolesRoute={EdaRoute.CredentialTypeAddUsers}
    />
  );
}
