import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';

export function WorkflowJobTemplateUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'workflowjobtemplate'}
      addRolesRoute={AwxRoute.WorkflowJobTemplateAddUsers}
    />
  );
}
