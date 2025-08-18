import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';
import { useParams } from 'react-router';
import { EdaRoute } from '../../main/EdaRoutes';

export function EventStreamTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'eda.eventstream'}
      addRolesRoute={EdaRoute.EventStreamAssignTeams}
    />
  );
}
