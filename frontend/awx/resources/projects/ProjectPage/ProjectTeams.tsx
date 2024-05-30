/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';
export function ProjectTeams() {
  const params = useParams<{ id: string }>();

  return (
    <TeamAccess
      service={'awx'}
      id={params.id || ''}
      type={'project'}
      addRolesRoute={AwxRoute.ProjectAddTeams}
    />
  );
}
