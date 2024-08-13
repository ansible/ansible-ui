import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { HubRoute } from '../../../main/HubRoutes';

export function HubTeamRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service="hub"
      id={props.id || params.id || ''}
      type="team-roles"
      addRolesRoute={props.addRolesRoute || HubRoute.TeamAddRoles}
    />
  );
}
