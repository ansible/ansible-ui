import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { UserAccess } from '../../../../common/access/components/UserAccess';

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
