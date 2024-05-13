import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { UserAccess } from '../../../../common/access/components/UserAccess';

export function InstanceGroupUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'instancegroup'}
      addRolesRoute={AwxRoute.InstanceGroupAddUsers}
    />
  );
}
