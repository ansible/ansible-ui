import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function WorkflowJobTemplateTeamAccess() {
  const params = useParams<{ id: string }>();
  return (
    <PlatformTeamAccess
      id={params.id || ''}
      type={'awx.workflowjobtemplate'}
      addRolesRoute={AwxRoute.WorkflowJobTemplateAssignTeams}
    />
  );
}
