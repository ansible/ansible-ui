import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function CredentialUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'credential'}
      addRolesRoute={AwxRoute.CredentialAddUsers}
    />
  );
}
