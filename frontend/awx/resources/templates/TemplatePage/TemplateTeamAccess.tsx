import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';

export function TemplateTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'jobtemplate'}
      addRolesRoute={AwxRoute.JobTemplateAddTeams}
    />
  );
}
