import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ResourceUserAccess } from '../../../../common/access/components/ResourceUserAccess';

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
