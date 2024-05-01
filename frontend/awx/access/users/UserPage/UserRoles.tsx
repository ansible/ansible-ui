import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';

export function UserRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service="awx"
      id={props.id || params.id || ''}
      type="user-roles"
      addRolesRoute={props.addRolesRoute || AwxRoute.AddRolesToUser}
    />
  );
}
