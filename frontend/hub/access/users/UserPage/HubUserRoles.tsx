import { ResourceAccess } from '@ansible/common-ui/access/components/ResourceAccess';
import { useParams } from 'react-router';
import { HubRoute } from '../../../main/HubRoutes';

export function HubUserRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service="hub"
      id={props.id || params.id || ''}
      type="user-roles"
      addRolesRoute={props.addRolesRoute || HubRoute.UserAddRoles}
    />
  );
}
