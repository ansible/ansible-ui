/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
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
