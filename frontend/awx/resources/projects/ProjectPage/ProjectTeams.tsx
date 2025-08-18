import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';

export function ProjectTeams() {
  const params = useParams<{ id: string }>();

  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'awx.project'}
      addRolesRoute={AwxRoute.ProjectAssignTeams}
    />
  );
}
