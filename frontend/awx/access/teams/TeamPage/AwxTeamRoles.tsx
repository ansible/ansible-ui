import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
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
