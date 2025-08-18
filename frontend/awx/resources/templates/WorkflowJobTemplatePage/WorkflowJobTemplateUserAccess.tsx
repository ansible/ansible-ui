import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';

export function WorkflowJobTemplateUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <ResourceUserAccess
      service="awx"
      id={params.id || ''}
      type={'awx.workflowjobtemplate'}
      addRolesRoute={AwxRoute.WorkflowJobTemplateAddUsers}
      manageRoleRoute={AwxRoute.WorkflowJobTemplateManageUsers}
    />
  );
}
