import { ResourceAccess } from '@ansible/common-ui/access/components/ResourceAccess';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';

export function AwxTeamRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service={'awx'}
      id={props.id || params.id || ''}
      type="team-roles"
      addRolesRoute={props.addRolesRoute || AwxRoute.AddRolesToTeam}
    />
  );
}
