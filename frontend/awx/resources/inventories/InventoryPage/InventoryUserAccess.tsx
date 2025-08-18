import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';

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
