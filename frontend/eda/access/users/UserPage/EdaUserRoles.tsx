import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../../main/EdaRoutes';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';

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
