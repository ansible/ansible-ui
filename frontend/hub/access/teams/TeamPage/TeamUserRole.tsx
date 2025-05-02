import { ResourceAccess } from '@ansible/common-ui/access/components/ResourceAccess';
import { useParams } from 'react-router';
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
