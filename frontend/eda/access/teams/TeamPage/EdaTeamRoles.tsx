import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EdaTeamRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service={'eda'}
      id={props.id || params.id || ''}
      type="team-roles"
      addRolesRoute={props.addRolesRoute || EdaRoute.TeamAddRoles}
    />
  );
}
