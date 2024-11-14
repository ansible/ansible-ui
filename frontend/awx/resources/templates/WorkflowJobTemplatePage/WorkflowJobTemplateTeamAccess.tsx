import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function WorkflowJobTemplateTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'workflowjobtemplate'}
      addRolesRoute={AwxRoute.WorkflowJobTemplateAddTeams}
    />
  );
}
