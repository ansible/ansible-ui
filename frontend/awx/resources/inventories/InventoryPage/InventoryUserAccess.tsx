import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function InventoryUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="awx"
      id={params.id || ''}
      type={'awx.inventory'}
      addRolesRoute={AwxRoute.InventoryAddUsers}
      manageRoleRoute={AwxRoute.InventoryManageUsers}
    />
  );
}
