import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { AwxRoute } from '../../../main/AwxRoutes';

export function TeamRoles() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceAccess
      service={'awx'}
      id={params.id || ''}
      type="team-roles"
      addRolesRoute={AwxRoute.AddRolesToTeam}
    />
  );
}
