import { useParams } from 'react-router-dom';
import { UserAccess } from '../../../../common/access/components/UserAccess';
import { AwxRoute } from '../../../main/AwxRoutes';

export function InventoryUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'inventory'}
      addRolesRoute={AwxRoute.InventoryAddUsers}
    />
  );
}
