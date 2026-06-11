import { useParams } from 'react-router-dom';
import { ResourceUserAccess } from '../../../../common/access/components/ResourceUserAccess';
import { AwxRoute } from '../../../main/AwxRoutes';

export function CredentialUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="awx"
      id={params.id || ''}
      type={'awx.credential'}
      addRolesRoute={AwxRoute.CredentialAddUsers}
      manageRoleRoute={AwxRoute.CredentialManageUsers}
    />
  );
}
