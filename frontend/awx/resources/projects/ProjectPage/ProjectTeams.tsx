import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

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
