/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';

export function OrganizationTeamsAccess() {
  const params = useParams<{ id: string }>();

  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'organization'}
      addRolesRoute={AwxRoute.OrganizationAddTeams as string}
    />
  );
}
