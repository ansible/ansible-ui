import { ResourceAccess } from '@ansible/common-ui/access/components/ResourceAccess';
import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaUserRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service="eda"
      id={props.id || params.id || ''}
      type="user-roles"
      addRolesRoute={props.addRolesRoute || EdaRoute.UserAddRoles}
    />
  );
}
