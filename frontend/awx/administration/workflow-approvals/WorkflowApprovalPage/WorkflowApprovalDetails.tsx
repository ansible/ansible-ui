import { useParams } from 'react-router-dom';
import { PageDetails, PageDetailsFromColumns } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useWorkflowApprovalsColumns } from '../hooks/useWorkflowApprovalsColumns';

export function WorkflowApprovalDetails() {
  const params = useParams<{ id: string }>();
  const { data: workflowApproval } = useGetItem<WorkflowApproval>(
    awxAPI`/workflow_approvals`,
    params.id
  );
  const columns = useWorkflowApprovalsColumns();
  return workflowApproval ? (
    <PageDetails>
      <PageDetailsFromColumns item={workflowApproval} columns={columns} />
    </PageDetails>
  ) : null;
}
