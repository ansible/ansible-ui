import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useParams } from 'react-router';
import { EdaRoute } from '../../../main/EdaRoutes';

export function CredentialUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="eda"
      id={params.id || ''}
      type={'eda.edacredential'}
      addRolesRoute={EdaRoute.CredentialAddUsers}
      manageRoleRoute={EdaRoute.CredentialManageUsers}
    />
  );
}
